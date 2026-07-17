from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
from pathlib import Path
from pypdf import PdfReader
import os
from dotenv import load_dotenv
from groq import Groq
import json
from pydantic import ValidationError
from schemas.user import User
from dateutil import parser as date_parser
from dateutil.relativedelta import relativedelta
from datetime import datetime

load_dotenv()

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise ValueError("API key not found!")

client = Groq(api_key=groq_api_key)

model = "llama-3.3-70b-versatile"

role = "user"


def extract_text(file_path: str):
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        text += page.extract_text()

    return text


CURRENT_JOB_MARKERS = {"present", "current", "currently working", "ongoing", "till date", "now", ""}


def compute_years(start_date: str, end_date: str) -> float | None:
    if not start_date:
        return None
    try:
        start = date_parser.parse(start_date, default=datetime(1900, 1, 1), fuzzy=True)
    except (ValueError, TypeError, OverflowError):
        return None

    end_normalized = (end_date or "").strip().lower()
    if end_normalized in CURRENT_JOB_MARKERS:
        end = datetime.now()
    else:
        try:
            end = date_parser.parse(end_date, default=datetime(1900, 1, 1), fuzzy=True)
        except (ValueError, TypeError, OverflowError):
            end = datetime.now()

    if end < start:
        return None

    delta = relativedelta(end, start)
    total_months = delta.years * 12 + delta.months
    if total_months < 0:
        return None

    return round(total_months / 12, 1)


@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)

    if not text or not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the uploaded PDF.")

    schema = User.model_json_schema()

    response_format = {"type": "json_object"}

    system_prompt = f"""
    You are an expert resume information extraction assistant.
    Your task is to extract structured information from the resume provided by the user.
    Rules:
    1. Return ONLY valid JSON.
    2. The JSON must strictly follow the provided schema.
    3. Do not include any explanations, markdown, or extra text.
    4. If a field is missing or cannot be determined, return null for that field.
    5. Do not invent or infer information that is not explicitly mentioned in the resume.
    6. Preserve the original spelling and capitalization of names, companies, skills, and job titles.
    7. Extract all work experiences in chronological order if possible.
    8. Extract all technical and non-technical skills mentioned.
    9. If the resume contains multiple experiences or skills, include all of them in the corresponding arrays.
    10. For each experience, extract start_date exactly as written (e.g. "Jan 2023", "2021").
        If the candidate is currently working at that job (indicated by words like
        "Present", "Current", "Ongoing", "Till date", "Now", or an empty/missing end date
        for the most recent role), set end_date to the literal string "Present".
        Otherwise extract end_date exactly as written.
    11. Do NOT calculate or guess years_of_experience yourself — leave it null; it will be
        computed separately from the dates.

    Return JSON strictly matching the following schema:

    {schema}
    """

    message_system = {"role": "system", "content": system_prompt}

    prompts = f'''This is a candidate resume. please extract all information and from this {text}'''

    message = {"role": role, "content": prompts}

    messages = [message_system, message]

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            response_format=response_format,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM request failed: {e}")

    answer = response.choices[0].message.content

    try:
        data_file = json.loads(answer)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=502, detail="LLM returned malformed JSON. Please retry.")

    try:
        user = User(**data_file)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Extracted data did not match expected schema: {e.errors()}")

    for exp in user.experiences:
        exp.years_of_experience = compute_years(exp.start_date, exp.end_date)

    valid_durations = [exp.years_of_experience for exp in user.experiences if exp.years_of_experience is not None]
    total_experience = round(sum(valid_durations), 1) if valid_durations else None

    user.total_experience = total_experience

    return {"data": user}
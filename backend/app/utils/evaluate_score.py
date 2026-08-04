import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client= Groq(api_key=os.getenv("GROQ_API_KEY"))
model = "llama-3.3-70b-versatile"

def build_resume_summary(resume:dict) -> str:

    parts = [
        f"Name: {resume.get("name")}",
        f"Summary: {resume.get('summary')}",
        f"Total Experience: {resume.get('total_experience')} years",
    ]

    if resume.get("skills"):
        skills = ", ".join(s["name"] for s in resume["skills"])
        parts.append(f"Skills:{skills}")

    if resume.get("experiences"):
        for exp in resume["experiences"]:
            parts.append(f"Experience:{exp.get('role')} at {exp.get('companyName')} - {exp.get('description')}")

    if resume.get('projects'):
        for p in resume["projects"]:
            parts.append(f"Project: {p.get('title')} ({', '.join(p.get('technologies', []))}) — {p.get('description')}")

    if resume.get("education"):
        for edu in resume["education"]:
            parts.append(f"Education: {edu.get('degree')} in {edu.get('fieldOfStudy')} at {edu.get('college')}")
    
    return "\n".join(parts)

def score_resume(resume:dict, job_description:str) ->dict:
    resume_text = build_resume_summary(resume)

    system_prompt = """
    You are an expert technical recruiter. Score how well a candidate's resume
    matches a given job description.

    Rules:
    1. Return ONLY valid JSON: {"score": <int 0-100>, "reasoning": "<short explanation>"}
    2. Score based on skills match, relevant experience, and project relevance.
    3. Reasoning must be 1-3 sentences, specific to this candidate.
    4. Do not invent skills or experience not present in the resume.
    """

    user_prompt = f"""
    Job Description:
    {job_description}

    Candidate Resume:
    {resume_text}
    """
    user_message = {
        'role':'user',
        'content':user_prompt
    }

    system_message ={
        "role":"system",
        "content":system_prompt
    }
    messages = [system_message,user_message]

    response = client.chat.completions.create(
        model = model,
        messages = messages,
        response_format={"type":"json_object"},
    )


    result = json.loads(response.choices[0].message.content)
    return {"score":int(result["score"]),"reasoning":result["reasoning"]}
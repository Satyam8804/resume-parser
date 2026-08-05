import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
model = "llama-3.3-70b-versatile"


def build_resume_summary(resume: dict) -> str:
    parts = [
        f"Name: {resume.get('name')}",
        f"Summary: {resume.get('summary')}",
        f"Total Experience: {resume.get('total_experience')} years",
    ]

    if resume.get("skills"):
        skills = ", ".join(s["name"] for s in resume["skills"])
        parts.append(f"Skills: {skills}")

    if resume.get("experiences"):
        for exp in resume["experiences"]:
            parts.append(f"Experience: {exp.get('role')} at {exp.get('companyName')} - {exp.get('description')}")

    if resume.get("projects"):
        for p in resume["projects"]:
            parts.append(f"Project: {p.get('title')} ({', '.join(p.get('technologies', []))}) — {p.get('description')}")

    if resume.get("education"):
        for edu in resume["education"]:
            parts.append(f"Education: {edu.get('degree')} in {edu.get('fieldOfStudy')} at {edu.get('college')}")

    return "\n".join(parts)


def score_resume(resume: dict, job_description: str) -> dict:
    resume_text = build_resume_summary(resume)

    system_prompt = """
    You are an expert technical recruiter. Score how well a candidate's resume
    matches a given job description.

    Rules:
    1. Base your evaluation strictly on what's explicitly stated in the resume.
       Do not invent, infer, or assume skills or experience not present in the resume.
    2. matching_skills should list skills/technologies from the resume that
       align with the job description.
    3. missing_skills should list important skills/technologies required by the
       job description that are NOT present in the resume.
    4. experience_requirement_met should be true only if the candidate's total
       experience clearly satisfies what the job description asks for; false
       otherwise (including when the JD doesn't specify a requirement, use your
       best judgment based on seniority implied by the JD).
    5. verdict must be a single concise sentence summarizing the overall fit.
    6. score must be an integer from 0 to 100 reflecting overall match quality.

    Return ONLY valid JSON in this exact shape, with no extra text or markdown:
    {
      "candidate_name": "<string>",
      "matching_skills": ["<string>", ...],
      "missing_skills": ["<string>", ...],
      "experience_requirement_met": <true|false>,
      "score": <integer 0-100>,
      "verdict": "<short one-sentence verdict>"
    }
    """

    user_prompt = f"""
    Job Description:
    {job_description}

    Candidate Resume:
    {resume_text}
    """

    user_message = {"role": "user", "content": user_prompt}
    system_message = {"role": "system", "content": system_prompt}
    messages = [system_message, user_message]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content)

    return {
        "candidate_name": result.get("candidate_name", resume.get("name", "Unknown")),
        "matching_skills": result.get("matching_skills", []),
        "missing_skills": result.get("missing_skills", []),
        "experience_requirement_met": bool(result.get("experience_requirement_met", False)),
        "score": int(result["score"]),
        "verdict": result.get("verdict", ""),
    }
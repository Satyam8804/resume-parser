from pydantic import BaseModel, field
from datetime import datetime

class Job(BaseModel):
    title: str
    description:str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ScoreResult(BaseModel):
    job_id: str
    resume_id: str
    candidate_name: str
    matching_skills: list[str] = []
    missing_skills: list[str] = []
    experience_requirement_met: bool = False
    score: int
    verdict: str = ""
    scored_at: datetime = Field(default_factory=datetime.utcnow)
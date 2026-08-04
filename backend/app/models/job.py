from pydantic import BaseModel, field
from datetime import datetime

class Job(BaseModel):
    title: str
    description:str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ScoreResult(BaseModel):
    job_id: str
    resume_id:str
    candidate_name:str
    score:int
    reasoning:str
    scored_at: datetime = Field(default_factory=datetime.utcnow)

from pydantic import BaseModel

class JobCreate(BaseModel):
    title:str
    description:str

class RankingItem(BaseModel):
    resume_id:str
    candidate_name:str
    score:int
    reasoning:str
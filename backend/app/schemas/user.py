from pydantic import BaseModel
from schemas.experience import Experience
from schemas.education import Education
from schemas.project import Project
from schemas.certification import Certification
from schemas.skill import Skill

class User(BaseModel):
    name: str
    email: str
    summary: str
    phone: str | None = None
    linkedin: str | None = None
    github: str | None = None
    portfolio: str | None = None
    total_experience: float | None = None   
    experiences: list[Experience]
    education: list[Education]
    projects: list[Project]
    certifications: list[Certification]
    skills: list[Skill]
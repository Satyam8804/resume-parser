from pydantic import BaseModel

from app.schemas.experience import Experience
from app.schemas.education import Education
from app.schemas.project import Project
from app.schemas.certification import Certification
from app.schemas.skill import Skill


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
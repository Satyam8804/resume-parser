from pydantic import BaseModel

class Project(BaseModel):
    title: str
    technologies: list[str]
    description: str
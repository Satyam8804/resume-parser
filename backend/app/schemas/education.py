from pydantic import BaseModel

class Education(BaseModel):
    degree: str
    college: str
    fieldOfStudy:str | None = None
    year: int | None = None
    cgpa: float | None = None
from pydantic import BaseModel

class Experience(BaseModel):
    companyName: str
    role: str
    description: str
    start_date: str | None = None
    end_date: str | None = None
    years_of_experience: float | None = None
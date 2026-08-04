from pydantic import BaseModel

class Certification(BaseModel):
    name: str
    issuer: str
    date: str| None = None
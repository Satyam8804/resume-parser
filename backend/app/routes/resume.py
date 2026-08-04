from fastapi import APIRouter, HTTPException
from app.db import db
from app.schemas.user import User

router = APIRouter(prefix="/api/resumes",tags=["resumes"])

@router.post("/")
async def save_resume(resume:User):
    result = await db["resumes"].insert_one(resume.model_dump())
    return {"id":str(result.inserted_id),"message":"Resume saved"}

from fastapi import APIRouter, HTTPException,BackgroundTasks
from bson import ObjectId
from app.db import db
from app.schemas.job import JobCreate
from app.utils.evaluate_score import score_resume
from datetime import datetime
import asyncio

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("/")
async def create_job(job:JobCreate):
    result = await db["jobs"].insert_one({
        "title": job.title,
        "description": job.description,
        "created_at": datetime.utcnow(),
    })

    return {"id": str(result.inserted_id),"message":"Job created"}


async def run_scoring(job_id: str, job_description: str):
    resumes = await db["resumes"].find().to_list(length=None)
    total = len(resumes)

    await db["jobs"].update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": "in_progress", "total_resumes": total, "scored_count": 0}},
    )

    for i, resume in enumerate(resumes):
        try:
            result = score_resume(resume, job_description)
        except Exception as e:
            print(f"Scoring failed for resume {resume['_id']}: {e}")
            continue

        await db["scores"].update_one(
            {"job_id": job_id, "resume_id": str(resume["_id"])},
            {"$set": {
                "job_id": job_id,
                "resume_id": str(resume["_id"]),
                "candidate_name": result["candidate_name"],
                "matching_skills": result["matching_skills"],
                "missing_skills": result["missing_skills"],
                "experience_requirement_met": result["experience_requirement_met"],
                "score": result["score"],
                "verdict": result["verdict"],
                "scored_at": datetime.utcnow(),
            }},
            upsert=True,
        )

        await db["jobs"].update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {"scored_count": i + 1}},
        )

        if i < total - 1:
            await asyncio.sleep(2)

    await db["jobs"].update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": "completed"}},
    )
@router.get("/{job_id}")
async def get_job(job_id: str):
    job = await db["jobs"].find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["_id"] = str(job["_id"])
    return job

@router.post("/{job_id}/score-all")
async def score_all(job_id: str, background_tasks: BackgroundTasks):
    job = await db["jobs"].find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    background_tasks.add_task(run_scoring, job_id, job["description"])
    return {"message": "Scoring started in background"}


@router.get("/{job_id}/score-status")
async def score_status(job_id: str):
    job = await db["jobs"].find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "status": job.get("status", "not_started"),
        "total_resumes": job.get("total_resumes", 0),
        "scored_count": job.get("scored_count", 0),
    }

@router.get("/{job_id}/rankings")
async def get_ranking(job_id: str):
    scores = await db["scores"].find({"job_id": job_id}).sort("score", -1).to_list(length=None)

    for s in scores:
        s["_id"] = str(s["_id"])

    return scores

@router.get("/")
async def list_jobs():
    jobs = await db["jobs"].find().sort("created_at", -1).to_list(length=None)
    for j in jobs:
        j["_id"] = str(j["_id"])
    return jobs

@router.delete("/{job_id}")
async def delete_job(job_id: str):
    job = await db["jobs"].find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db["jobs"].delete_one({"_id": ObjectId(job_id)})
    await db["scores"].delete_many({"job_id": job_id})  # clean up orphaned scores

    return {"message": "Job deleted"}


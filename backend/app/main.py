from fastapi import FastAPI, UploadFile, File
from app.routes.upload import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from app.db import db
from app.routes.resume import router as resume_router
from app.routes.job import router as job_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://resume-parser-1-r41j.onrender.com", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(resume_router)
app.include_router(job_router)

@app.on_event("startup")
async def startup():
    await db.command("ping")
    print("Mongo connected")


@app.get("/")
async def root():
    return {"message": "FastAPI is running 🚀"}
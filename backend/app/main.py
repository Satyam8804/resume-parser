from fastapi import FastAPI,UploadFile,File
from routes.upload import router as upload_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

@app.get("/")
async def root():
    return {"message":"FastAPI is running 🚀"}




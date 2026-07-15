from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.scheduler import start_scheduler
from app.auto_timeout import auto_timeout
from app.utils.db import engine
from app.models import intern_model
from app.routes import intern_route, attendance_route
from app.routes import intern_history_route
import os

#make folder for qrcodes    
os.makedirs("qrcodes", exist_ok=True)

intern_model.Base.metadata.create_all(bind=engine)

app = FastAPI()

#origin for react
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, #allow origin
    allow_credentials=True, #cookies/auth headers
    allow_methods=["*"], #allow http methods
    allow_headers=["*"], #allow headers
)
#apscheduler start
@app.on_event("startup")
def startup_event():
    start_scheduler()
    auto_timeout()

#test server running
@app.get("/")
def root():
    return {"message": "Attendance system running."}

app.mount("/qrcodes", StaticFiles(directory="qrcodes"), name="qrcodes")
app.include_router(intern_route.router, prefix="/intern", tags=["intern"])
app.include_router(attendance_route.router, prefix="/attendance", tags=["attendance"])
app.include_router(intern_history_route.router, prefix="/history", tags=["intern_history"])
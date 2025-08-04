from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.utils.db import engine
from app.models import intern_model
from app.routes import intern_route, attendance_route
import os

os.makedirs("qrcodes", exist_ok=True)

intern_model.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")       
async def Home():   
    return "Hello World"

app.mount("/qrcodes", StaticFiles(directory="qrcodes"), name="qrcodes")
app.include_router(intern_route.router, prefix="/intern", tags=["intern"])
app.include_router(attendance_route.router, prefix="/attendance", tags=["attendance"])
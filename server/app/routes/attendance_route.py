from fastapi import APIRouter, HTTPException, Path, Depends
from app.utils.db import SessionLocal, get_db
from sqlalchemy.orm import Session
from app.schemas.attendance_schema import AttendanceSchema, ReqAttendance, ResAttendance 
from app.schemas.intern_schema import ReqIntern
from app.crud import attendance, intern

router = APIRouter()

@router.post("/register")
async def registerAttendance(request:ReqAttendance, requestIntern:ReqIntern, intern_name:str, session:Session=Depends(get_db)):
    _attendance = attendance.registerAttendance(session, attendance=request.parameter, intern_id=requestIntern.parameter.intern_id)
    _intern_name = requestIntern.parameter.intern_name
    return ResAttendance(code="201",
                         status="Created",
                         message=f"Attendance by {_intern_name} successfully added.",
                         result=_attendance).model_dump(exclude_none=True)

@router.post("/scan")
async def scanQRAttendance():
    
    pass

@router.get("/timesheet/{school_name}")
async def displayTimesheet():
    pass

@router.patch("/timesheet/edit/{id}")
async def updateTimesheet():
    pass

@router.delete("/timesheet/delete/{id}")
async def deleteTimesheetById():
    pass

@router.get("/export")
async def exportTimesheetBySchool():
    pass



    

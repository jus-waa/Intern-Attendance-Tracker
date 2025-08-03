from fastapi import APIRouter, HTTPException, Path, Depends
from app.utils.db import SessionLocal, get_db
from sqlalchemy.orm import Session
from app.schemas.attendance_schema import ResAttendance, ReqClockIn, ReqUpdateAttendance
from app.schemas.intern_schema import ReqIntern
from app.crud import attendance, intern
from datetime import datetime

router = APIRouter()

@router.post("/register")
async def registerAttendance(request:ReqClockIn, session:Session=Depends(get_db)):
    _attendance = attendance.registerAttendance(session, intern_id=request.intern_id)
    _intern_id=request.intern_id
    return ResAttendance(code="201",
                         status="Created",
                         message=f"Attendance by {_intern_id} successfully added.",
                         result=_attendance).model_dump(exclude_none=True)

@router.post("/scan")
async def scanQRAttendance():
    pass

@router.get("/timesheet/{school_name}")
async def getAllBySchool(school_name:str, session:Session=Depends(get_db)):
    _attendance = attendance.getBySchool(session, school_name, 0, 100)
    return ResAttendance(code="200",
                         status="Ok",
                         message=f"Intern from {school_name} fetched successfully.",
                         result=_attendance
                         ).model_dump(exclude_none=True)

@router.patch("/timesheet/edit")
async def update(request:ReqUpdateAttendance, session:Session=Depends(get_db)):
    _attendance = attendance.updateAttendance(session,
                                              intern_id=request.intern_id,
                                              time_out=request.time_out,
                                              check_in=request.check_in,
                                              remarks=request.remarks,
                                              )
    return ResAttendance(code="200",
                         status="Updated",
                         message="Attendance updated successfully.",
                         result=_attendance
                         ).model_dump(exclude_none=True)

@router.delete("/timesheet/delete/{id}")
async def deleteById():
    pass

@router.get("/export")
async def exportBySchool():
    pass



    

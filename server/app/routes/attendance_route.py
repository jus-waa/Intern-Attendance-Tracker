from fastapi import APIRouter, HTTPException, Path, Depends
from app.utils.db import SessionLocal, get_db
from sqlalchemy.orm import Session
from app.schemas.attendance_schema import ResAttendance, ReqClockIn, ReqUpdateAttendance, AttendanceSchema
from app.schemas.intern_schema import ReqIntern
from app.crud import attendance, intern
from datetime import date, datetime, timedelta
from app.models.attendance_model import Attendance


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

    #get existing record
    existing_attendance = session.query(Attendance).filter(
        Attendance.intern_id == request.intern_id,
        Attendance.attendance_date == date.today()  
    ).first()
    
    #get existing time in
    time_in_datetime = existing_attendance.time_in
    #for test purposes
    #time_in_datetime = datetime.fromisoformat('2025-08-03T23:45:35.599136')
    #get time out 
    time_out_datetime = datetime.combine(date.today(), request.time_out)
    #calculate total hours
    total_hours = time_out_datetime - time_in_datetime

    _attendance = attendance.updateAttendance(session,
                                            intern_id=request.intern_id,
                                            time_out=time_out_datetime, 
                                            check_in=request.check_in,
                                            remarks=request.remarks,
                                            total_hours=total_hours
                                            )
    return ResAttendance(code="200",
                         status="Updated",
                         message="Attendance updated successfully.",
                         result=_attendance
                         ).model_dump(exclude_none=True)

@router.delete("/timesheet/delete")
async def deleteById(request: AttendanceSchema, session: Session=Depends(get_db)):
    _attendance = attendance.removeAttendance(session, intern_id=request.intern_id)
    return ResAttendance(code="200",
                     status="Ok",
                     message="Intern Information removed successfully.",
                     result=_attendance
                     ).model_dump(exclude_none=True)




    

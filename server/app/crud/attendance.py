from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, time, timedelta
from app.models.attendance_model import Attendance
from app.schemas.attendance_schema import AttendanceSchema

def getAllAttendance(session:Session, skip:int = 0, limit:int = 100):
    _attendance = session.query(Attendance).offset(skip).limit(limit).all()
    if not _attendance:
        raise HTTPException(status_code=404, detail="No attendance found.")
    return _attendance

def getAttendanceById(session:Session, attendance_id: int):
    _attendance = session.query(Attendance).filter(Attendance.attendance_id == attendance_id).first()
    if not _attendance:
        raise HTTPException(status_code=404, detail=f"Attendance with id:{attendance_id} not found.")
    return _attendance

def registerAttendance(session:Session, attendance: AttendanceSchema):
    _attendance = Attendance(
        attendance_date=attendance.attendance_date,
        time_in=attendance.time_in,
        time_out=attendance.time_out,
        total_hours=attendance.total_hours,
        check_in=attendance.check_in,
        remarks=attendance.remarks
    )
    session.add(_attendance)
    session.commit()
    session.refresh(_attendance)
    
    if not _attendance:
        raise HTTPException(status_code=404, detail="")
    return _attendance

def removeAttendance(session:Session, attendance_id: int):
    _attendance = getAttendanceById(session=session, attendance_id=attendance_id)
    session.delete(_attendance)
    session.commit()
    
    if not _attendance:
        raise HTTPException(status_code=404, detail="Failed to delete attendance")
    return {"message": f"Attendance with id {attendance_id} deleted successfully."}

def updateAttendance(session:Session, attendance_id: int, 
                    intern_id: int,
                    attendance_date: datetime,
                    time_in: time,
                    time_out: time,
                    total_hours: timedelta,
                    check_in: str,
                    remarks: str):
    _attendance = getAttendanceById(session=session, attendance_id=attendance_id)
    
    _attendance.attendance_id=attendance_id
    _attendance.intern_id=intern_id
    _attendance.attendance_date=attendance_date
    _attendance.time_in=time_in
    _attendance.time_out=time_out
    _attendance.total_hours=total_hours
    _attendance.check_in=check_in
    _attendance.remarks=remarks
    
    session.commit()
    session.refresh(_attendance)
    
    if not _attendance:
        raise HTTPException(status_code=404, detail="Update attendance failed")
    return _attendance
    
    


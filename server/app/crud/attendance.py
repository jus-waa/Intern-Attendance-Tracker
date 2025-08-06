from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date, time, timedelta, datetime
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.schemas.attendance_schema import ReqUpdateAttendance
from app.utils.helper import convert_total_hours_to_float
from uuid import UUID

def getAllAttendance(session:Session, skip:int = 0, limit:int = 100):
    attendances = session.query(Attendance).offset(skip).limit(limit).all()
    
    if not attendances:
        raise HTTPException(status_code=404, detail="No attendance found.")

    return attendances

def getAttendanceById(session:Session, intern_id: UUID):
    _attendance = session.query(Attendance).filter(Attendance.intern_id == intern_id).first()
    if not _attendance:
        raise HTTPException(status_code=404, detail=f"Attendance with id:{intern_id} not found.")
    return _attendance

def getBySchool(session:Session, school_name: str, skip:int = 0, limit:int = 100):
    _attendance = session.query(Attendance).filter(Intern.school_name == school_name).all()
    if not _attendance:
        raise HTTPException(status_code=404, detail=f"Attendance with id:{school_name} not found.")
    return _attendance

def checkInAttendance(session:Session, intern_id:UUID):
    #validate if intern_id in attendance table is similar
    intern = session.query(Intern).filter(
        Intern.intern_id == intern_id
        ).first()
    #check for check in
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found.")
    #check for existing attendance
    existing_attendance =  session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == date.today()
    ).first()

    if existing_attendance:
        raise HTTPException(status_code=400, detail="Attendance already exist for today.")
    #register time in
    _attendance = Attendance(
        intern_id=intern_id,
        attendance_date=date.today(),
        time_in=datetime.today()
        #for testing
        #date(2025, 8, 5),
        #(2025, 8, 5, 6, 0, 0)
    )
    session.add(_attendance)
    session.commit()
    session.refresh(_attendance)
    
    return {
        "message": "Checked in successfully.",
        "time_in": _attendance.time_in
    }
    
def checkOutAttendance(session:Session, intern_id: UUID):
    #check todays attendance
    attendance = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.time_out == None
    ).order_by(Attendance.time_in.desc()).first()
    
    if not attendance:
        raise HTTPException(status_code=404, detail="No check-in found today.")

    if attendance.time_out:
        raise HTTPException(status_code=400, detail="Already checked out today.")

    #register timeout
    time_out = datetime.now()
    total_hours = (time_out - attendance.time_in)
    attendance.time_out = time_out
    attendance.total_hours = total_hours
    
    session.commit()
    session.refresh(attendance)
    
    #calculate remaining hours
    intern = session.query(Intern).filter(
        Intern.intern_id == intern_id
    ).first()
    
    total_attended = session.query(func.sum(Attendance.total_hours)).filter(
        Attendance.intern_id == intern_id
    ).scalar() or 0
    
    #convert to hrs
    if intern.total_hours and total_attended:
        remaining = intern.total_hours - total_attended
        intern.time_remain = remaining  # already a timedelta
    else:
        intern.time_remain = intern.total_hours

    session.commit()
    session.refresh(intern)
    
    if not intern:
        raise HTTPException(status_code=404, detail="Failed to check-out.")
    
    return {
        "message": "Checked out successfully.",
        "time_out": attendance.time_out,
        "hours_today": attendance.total_hours,
        "remaining_hours": intern.time_remain
    }

def registerAttendanceByQr(session: Session, intern_id: UUID):
    #check todays attendance
    attendance = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == date.today()
    ).first()
    
    if not attendance:
        return checkInAttendance(session, intern_id)
        
    if attendance.time_out:
        raise HTTPException(status_code=400, detail="Already checked out today.")

    return checkOutAttendance(session, intern_id)

def removeAttendance(session:Session, intern_id: int):
    _attendance = getAttendanceById(session=session, intern_id=intern_id)
    session.delete(_attendance)
    session.commit()
    
    if not _attendance:
        raise HTTPException(status_code=404, detail="Failed to delete attendance")
    return {"message": f"Attendance with intern ID: {intern_id} deleted successfully."}

def updateAttendance(session:Session, 
                    intern_id: UUID,
                    check_in: str,
                    remarks: str,
                    total_hours: timedelta
                    ):
    
    _attendance = getAttendanceById(session=session, intern_id=intern_id)

    _attendance.check_in=check_in
    _attendance.remarks=remarks
    _attendance.total_hours=total_hours

    session.commit()
    session.refresh(_attendance)
    
    if not _attendance:
        raise HTTPException(status_code=404, detail="Update Intern failed.") 
    return _attendance


from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date, time, timedelta, datetime
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.schemas.attendance_schema import ReqUpdateAttendance
from uuid import UUID
def getAllAttendance(session:Session, skip:int = 0, limit:int = 100):
    _attendance = session.query(Attendance).offset(skip).limit(limit).all()
    if not _attendance:
        raise HTTPException(status_code=404, detail="No attendance found.")
    return _attendance

def getAttendanceById(session:Session, intern_id: UUID, skip:int = 0, limit:int = 100):
    _attendance = session.query(Attendance).filter(Attendance.intern_id == intern_id).first()
    if not _attendance:
        raise HTTPException(status_code=404, detail=f"Attendance with id:{intern_id} not found.")
    return _attendance

def getBySchool(session:Session, school_name: str, skip:int = 0, limit:int = 100):
    _attendance = session.query(Attendance).filter(Intern.school_name == school_name).all()
    if not _attendance:
        raise HTTPException(status_code=404, detail=f"Attendance with id:{school_name} not found.")
    return _attendance

def registerAttendance(session:Session ,intern_id:UUID):
    #validate if intern_id in attedance table is similar
    _intern = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == date.today()
        ).first()
    if _intern:
        raise HTTPException(status_code=400, detail="Attendance already exists for this time.")

    _attendance = Attendance(
        intern_id=intern_id,
        attendance_date=date.today(),
        time_in=datetime.now()
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

def updateAttendance(session:Session, 
                    intern_id: UUID,
                    time_out: time,
                    check_in: str,
                    remarks: str
                    ):
    
    _attendance = getAttendanceById(session=session, intern_id=intern_id)

    _attendance.time_out=time_out
    _attendance.check_in=check_in
    _attendance.remarks=remarks

    session.commit()
    session.refresh(_attendance)
    
    if not _attendance:
        raise HTTPException(status_code=404, detail="Update Intern failed.") 
    return _attendance


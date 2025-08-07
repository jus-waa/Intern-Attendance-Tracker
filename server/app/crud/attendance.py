from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date, time, timedelta, datetime
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.schemas.attendance_schema import ReqUpdateAttendance
from app.utils.helper import is_today_holiday
from datetime import timedelta
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

def getBySchool(session:Session, abbreviation: str, skip:int = 0, limit:int = 100):
    _attendance = (session.query(Attendance, Intern)
        .join(Attendance.intern)
        .filter(Intern.abbreviation == abbreviation)
        .offset(skip)
        .limit(limit)
        .all()
    )
    if not _attendance:
        raise HTTPException(status_code=404, detail=f"Attendance from school:{abbreviation} not found.")
    
    response = []
    
    for attendance, intern in _attendance: 
        response.append({
            "attendance_id": attendance.attendance_id,
            "intern_id": attendance.intern_id,
            "attendance_date": attendance.attendance_date,
            "time_in": attendance.time_in,
            "time_out": attendance.time_out,
            "total_hours": attendance.total_hours if attendance.total_hours is not None else 0,
            "check_in": attendance.check_in,
            "remarks": attendance.remarks,
            "updated_at": attendance.updated_at,
            "abbreviation": intern.abbreviation,
        })
    
    return {
        "code": 200,
        "status": "Ok",
        "message": f"Intern from {abbreviation} fetched successfully.",
        "result": response
    }
    
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
    #err handling for dups
    if existing_attendance:
        raise HTTPException(status_code=400, detail="Attendance already exist for today.")
    #check first if intern has a set time in 
    if not intern.time_in:
        raise HTTPException(status_code=400, detail="Intern has no scheduled time_in.")
    #check_in logic
    intern_time_in = datetime.combine(date.today(), datetime.now().time())
    intern_time_out = datetime.combine(date.today(), datetime.now().time())
    intern_scheduled_time_in = datetime.combine(date.today(), intern.time_in)
    intern_scheduled_time_out = datetime.combine(date.today(), intern.time_out)
    today = date.today()
    #check for offset
    previous_absent = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date < today,
        Attendance.attendance_date >= today - timedelta(days=7),  # optionally only check last 7 days
        Attendance.check_in == "Absent"
    ).order_by(Attendance.attendance_date.desc()).first()
    already_offset = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == today,
        Attendance.check_in == "Offset"
    ).first()
    check_in = None
    if is_today_holiday():
        check_in = "Holiday"
    elif today.weekday() in [5, 6] and previous_absent and not already_offset:
        check_in = "Offset"
    else:
        # No existing record, determine based on current time vs scheduled
        if intern_time_in < intern_scheduled_time_in - timedelta(minutes=15):
            check_in = "Early In"
        elif intern_time_in > intern_scheduled_time_in + timedelta(minutes=15):
            check_in = "Late"
        else:
            check_in = "Regular Hours"

    #register time in
    _attendance = Attendance(
        intern_id=intern_id,
        attendance_date=date.today(),
        time_in=datetime.now(),
        check_in=check_in
    )
    session.add(_attendance)
    session.commit()
    session.refresh(_attendance)
    
    return {
        "message": "Checked in successfully.",
        "time_in": _attendance.time_in,
        "check_in": _attendance.check_in
    }

def checkOutAttendance(session:Session, intern_id: UUID):
    # Check today's attendance
    attendance = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == date.today()
    ).first()
    
    if not attendance:
        raise HTTPException(status_code=404, detail="No check-in found today.")

    if attendance.time_out:
        raise HTTPException(status_code=400, detail="Already checked out today.")

    # Register timeout
    time_out = datetime.now()
    total_hours = (time_out - attendance.time_in)
    attendance.time_out = time_out
    attendance.total_hours = total_hours
    
    session.commit()
    session.refresh(attendance)
    
    # Calculate remaining hours
    intern = session.query(Intern).filter(
        Intern.intern_id == intern_id
    ).first()
    total_attended = session.query(func.sum(Attendance.total_hours)).filter(
        Attendance.intern_id == intern_id
    ).scalar() or 0
    if intern.total_hours and total_attended:
        remaining = intern.total_hours - total_attended
        intern.time_remain = remaining  # already a timedelta
    else:
        intern.time_remain = intern.total_hours
    #check_in logic
    intern_time_in = datetime.combine(date.today(), datetime.now().time())
    intern_time_out = datetime.combine(date.today(), datetime.now().time())
    intern_scheduled_time_in = datetime.combine(date.today(), intern.time_in)
    intern_scheduled_time_out = datetime.combine(date.today(), intern.time_out)
    today = date.today()
    check_in = None
    # No existing record, determine based on current time vs scheduled
    if intern_time_out < intern_scheduled_time_out - timedelta(minutes=15):
        check_in = "Early Out"
    elif intern_time_out > intern_scheduled_time_out + timedelta(minutes=15):
        check_in = "Overtime"
    else:
        check_in = "Regular Hours"

    session.commit()
    session.refresh(intern)

    if not intern:
        raise HTTPException(status_code=404, detail="Failed to check-out.")
    
    #mark as completed
    if intern.time_remain <= timedelta(0) and intern.status != "Completed":
        intern.status = "Completed"
        session.commit()
        session.flush()
        session.expire_all()  #ensures updated status is reflected

    school_interns = session.query(Intern).filter(Intern.school_name == intern.school_name).all()
    all_done = all(i.status in ["Completed", "Terminated"] for i in school_interns)

    if all_done:
        try:
            from app.crud.intern_history import transferSchoolToHistory
            transferSchoolToHistory(session, intern.school_name)
        except Exception as e:
            print(f"Auto-transfer failed for {intern.school_name}: {e}")

    return {
        "message": "Checked out successfully.",
        "time_out": attendance.time_out,
        "hours_today": attendance.total_hours,
        "remaining_hours": intern.time_remain,
        "check_in": check_in
    }

def registerAttendanceByQr(session: Session, intern_id: UUID):
    #check todays attendance
    attendance = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == date.today()
    ).first()
    
    if not attendance:
        return checkInAttendance(session, intern_id)
        
    if attendance.time_in is None:
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
                    remarks: str,
                    total_hours: timedelta
                    ):
    
    _attendance = getAttendanceById(session=session, intern_id=intern_id)

    _attendance.remarks=remarks
    _attendance.total_hours=total_hours

    session.commit()
    session.refresh(_attendance)
    
    if not _attendance:
        raise HTTPException(status_code=404, detail="Update Intern failed.") 
    return _attendance


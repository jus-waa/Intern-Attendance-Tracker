from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import date, time, timedelta, datetime
from app.crud import intern_history
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

def getAttendanceByDate(session: Session, target_date: date, skip: int = 0, limit: int = 100):
    attendances = (
        session.query(Attendance)
        .filter(Attendance.attendance_date == target_date)
        .offset(skip)
        .limit(limit)
        .all()
    )
    if not attendances:
        raise HTTPException(status_code=404, detail="No attendance found for that date.")

    return attendances

def getBySchool(session:Session, abbreviation: str, skip:int = 0, limit:int = 100):
    _attendance = (session.query(Attendance)
        .join(Intern, Attendance.intern_id == Intern.intern_id)
        .filter(Intern.abbreviation == abbreviation)
        .options(joinedload(Attendance.intern))
        .offset(skip)
        .limit(limit)
        .all()
    )
    if not _attendance:
        raise HTTPException(status_code=404, detail=f"Attendance from school:{abbreviation} not found.")
    
    response = []
    
    for record in _attendance:
        intern = record.intern
        response.append({
            "attendance_id": record.attendance_id,
            "intern_id": record.intern_id,
            "attendance_date": record.attendance_date,
            "time_in": record.time_in,
            "time_out": record.time_out,
            "total_hours": record.total_hours if record.total_hours else 0,
            "check_in": record.check_in,
            "remarks": record.remarks,
            "updated_at": record.updated_at,
            "abbreviation": intern.abbreviation if intern else None,
        })
        #auto complete intern if time_remain is 0
        if intern and intern.time_remain == 0 and intern.status != "Completed":
            intern.status = "Completed"
            session.add(intern)

    session.commit()
    try:
        result = intern_history.transferSchoolToHistory(session, abbreviation)
        print(result["message"])
    except HTTPException as e: 
        if e.status_code == 400:
            #if all are still not finished skip
            print(f"Auto-transfer skipped: {e.detail}")
        else:
            #error
            print(f"Error during auto-transfer: {e.detail}")
        
    return {
        "code": 200,
        "status": "Ok",
        "message": f"Intern from {abbreviation} fetched successfully.",
        "result": response
    }

def checkInAttendance(session: Session, intern_id: UUID):
    # validate if intern_id in attendance table is similar
    intern = session.query(Intern).filter(
        Intern.intern_id == intern_id
    ).first()
    
    # check for check in
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found.")
   
    # check first if intern has a set time in
    if not intern.time_in:
        raise HTTPException(status_code=400, detail="Intern has no scheduled time_in.")
   
    now = datetime.now()
    today = now.date()
   
    # Determine the correct attendance date based on shift logic
    is_night_shift = intern.time_out < intern.time_in
    
    if is_night_shift:
        # For night shifts, we need to determine which shift this check-in belongs to
        # Night shift example: 10 PM to 6 AM
        
        # Calculate today's shift start time
        today_shift_start = datetime.combine(today, intern.time_in)
        
        # Calculate yesterday's shift end time (which would be today early morning)
        yesterday = today - timedelta(days=1)
        yesterday_shift_end = datetime.combine(today, intern.time_out)  # Note: using today's date with time_out
        
        # Determine which shift this check-in belongs to
        if now <= yesterday_shift_end:
            # Checking in during the end portion of yesterday's night shift
            attendance_date = yesterday
        else:
            # Checking in for today's night shift
            attendance_date = today
    else:
        # Regular day shift
        attendance_date = today
   
    # check for existing attendance on the correct date
    existing_attendance = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == attendance_date
    ).first()
   
    # err handling for dups
    if existing_attendance:
        raise HTTPException(status_code=400, detail="Attendance already exist for this shift.")
   
    # Calculate the actual scheduled time_in for comparison
    if is_night_shift:
        if attendance_date == yesterday:
            # This is for yesterday's night shift, so scheduled time was yesterday
            intern_scheduled_time_in = datetime.combine(yesterday, intern.time_in)
        else:
            # This is for today's night shift
            intern_scheduled_time_in = datetime.combine(today, intern.time_in)
    else:
        # Regular day shift - scheduled time is on the attendance date
        intern_scheduled_time_in = datetime.combine(attendance_date, intern.time_in)   
        
    # check for offset
    previous_absent = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date < attendance_date,
        Attendance.attendance_date >= attendance_date - timedelta(days=7),  # optionally only check last 7 days
        Attendance.check_in == "Absent"
    ).order_by(Attendance.attendance_date.desc()).first()
   
    already_offset = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == attendance_date,
        Attendance.check_in == "Offset"
    ).first()
   
    check_in = None
    if is_today_holiday():
        check_in = "Holiday"
    elif attendance_date.weekday() in [5, 6] and previous_absent and not already_offset:
        check_in = "Offset"
    else:
        # Determine based on current time vs scheduled
        # Debug: Add some logging to see what's happening
        print(f"Current time: {now}")
        print(f"Scheduled time: {intern_scheduled_time_in}")
        print(f"15 min early threshold: {intern_scheduled_time_in - timedelta(minutes=15)}")
        print(f"15 min late threshold: {intern_scheduled_time_in + timedelta(minutes=15)}")
        
        if now < intern_scheduled_time_in - timedelta(minutes=15):
            check_in = "Early In"
        elif now > intern_scheduled_time_in + timedelta(minutes=15):
            check_in = "Late"
        else:
            check_in = "Regular Hours"
        
        print(f"Determined check_in status: {check_in}")
    
    # register time in with correct attendance date
    _attendance = Attendance(
        intern_id=intern_id,
        attendance_date=attendance_date,  # Use calculated attendance date
        time_in=now,
        check_in=check_in,
        abbreviation=intern.abbreviation,
        intern_name=intern.intern_name
    )
    session.add(_attendance)
    session.commit()
    session.refresh(_attendance)
   
    return {
        "message": "Checked in successfully.",
        "time_in": _attendance.time_in,  # Fixed: was attendance.time_in
        "check_in": _attendance.check_in  # Fixed: was attendance.check_in
    }

def calculate_total_attended_hours(session: Session, intern_id: UUID) -> timedelta:
    """
    Calculate total attended hours for an intern from all completed attendance records.
    """
    completed_attendances = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.total_hours.is_not(None)
    ).all()
    
    total_seconds = 0
    for record in completed_attendances:
        if record.total_hours:
            if isinstance(record.total_hours, timedelta):
                total_seconds += record.total_hours.total_seconds()
            else:
                # Handle other formats if needed
                total_seconds += float(record.total_hours)
    
    return timedelta(seconds=total_seconds)

def update_intern_remaining_hours(session: Session, intern_id: UUID):
    """
    Update the intern's remaining hours based on total attended hours.
    """
    intern = session.query(Intern).filter(Intern.intern_id == intern_id).first()
    if not intern:
        return False
    
    total_attended = calculate_total_attended_hours(session, intern_id)
    
    if intern.total_hours:
        remaining = intern.total_hours - total_attended
        intern.time_remain = remaining if remaining > timedelta(0) else timedelta(0)
    else:
        intern.time_remain = timedelta(0)
    
    # Update status if completed
    if intern.time_remain <= timedelta(0) and intern.status != "Completed":
        intern.status = "Completed"
    
    return True

# Updated checkOutAttendance function using helper functions
def checkOutAttendance(session: Session, intern_id):
    # Fetch intern
    intern = session.query(Intern).filter(Intern.intern_id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found.")
    
    now = datetime.now()
    
    # Find the active attendance record (same logic as before)
    today_attendance = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == now.date(),
        Attendance.time_out.is_(None)
    ).first()
    
    yesterday_attendance = None
    if not today_attendance:
        yesterday = now.date() - timedelta(days=1)
        yesterday_attendance = session.query(Attendance).filter(
            Attendance.intern_id == intern_id,
            Attendance.attendance_date == yesterday,
            Attendance.time_out.is_(None)
        ).first()
    
    attendance = today_attendance or yesterday_attendance
    
    if not attendance or not attendance.time_in:
        raise HTTPException(status_code=404, detail="No active check-in found for this shift.")
    
    if attendance.time_out:
        raise HTTPException(status_code=400, detail="Already checked out for this shift.")
    
    # Calculate total hours for this session
    time_in_naive = attendance.time_in.replace(tzinfo=None) if attendance.time_in.tzinfo else attendance.time_in
    attendance.time_out = now
    attendance.total_hours = now - time_in_naive
    
    # Handle overtime/early out logic (same as before)
    shift_date = attendance.attendance_date
    shift_start = datetime.combine(shift_date, intern.time_in)
    shift_end = datetime.combine(shift_date, intern.time_out)
    
    if intern.time_out < intern.time_in:
        shift_end += timedelta(days=1)
    
    if attendance.check_in == "Regular Hours":
        if now < shift_end - timedelta(minutes=15):
            attendance.check_in = "Early Out"
        elif now > shift_end + timedelta(minutes=15):
            attendance.check_in = "Overtime"
        else:
            attendance.check_in = "Regular Hours"
    elif attendance.check_in in ["Late", "Early In"]:
        if now > shift_end + timedelta(minutes=15):
            attendance.check_in = "Overtime"
    
    # Commit the attendance update first
    session.commit()
    session.refresh(attendance)
    
    # Update intern's remaining hours using helper function
    update_intern_remaining_hours(session, intern_id)
    
    session.commit()
    session.refresh(intern)
    
    # Auto-transfer logic (same as before)
    school_interns = session.query(Intern).filter(Intern.school_name == intern.school_name).all()
    if all(i.status in ["Completed", "Terminated"] for i in school_interns):
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
        "remarks": attendance.check_in
    }

def registerAttendanceByQr(session: Session, intern_id: UUID):
    # Get intern details to check if it's a night shift
    intern = session.query(Intern).filter(Intern.intern_id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found.")
    
    now = datetime.now()
    today = now.date()
    
    # For night shifts, we need to check both today and yesterday's attendance
    # First check today's attendance
    today_attendance = session.query(Attendance).filter(
        Attendance.intern_id == intern_id,
        Attendance.attendance_date == today,
        Attendance.time_out.is_(None)  # Only unchecked-out records
    ).first()
    
    # If no today's attendance, check yesterday (for night shifts that started yesterday)
    yesterday_attendance = None
    if not today_attendance:
        yesterday = today - timedelta(days=1)
        yesterday_attendance = session.query(Attendance).filter(
            Attendance.intern_id == intern_id,
            Attendance.attendance_date == yesterday,
            Attendance.time_out.is_(None)  # Only unchecked-out records
        ).first()
    
    # Determine which attendance record to use
    attendance = today_attendance or yesterday_attendance
    
    # If no existing attendance record, this is a check-in
    if not attendance:
        return checkInAttendance(session, intern_id)
    
    # If time_in is None (shouldn't happen but just in case)    
    if attendance.time_in is None:
        return checkInAttendance(session, intern_id)
    
    # If already checked out
    if attendance.time_out:
        raise HTTPException(status_code=400, detail="Already checked out for this shift.")
    
    # Otherwise, this is a check-out
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
                    total_hours: timedelta,
                    intern_name: str
                    ):
    
    _attendance = getAttendanceById(session=session, intern_id=intern_id)

    _attendance.remarks=remarks
    _attendance.total_hours=total_hours
    _attendance.intern_name=intern_name

    session.commit()
    session.refresh(_attendance)
    
    if not _attendance:
        raise HTTPException(status_code=404, detail="Update Intern failed.") 
    return _attendance


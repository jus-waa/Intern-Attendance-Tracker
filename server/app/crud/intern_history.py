from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta
from uuid import UUID
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.models.intern_history_model import InternHistory


def getAllInternHistory(session: Session, skip: int = 0, limit: int = 100):
    intern_history = session.query(InternHistory).offset(skip).limit(limit).all()
    if not intern_history:
        raise HTTPException(status_code=404, detail="No intern history records found.")
    return intern_history


def getInternHistoryById(session: Session, intern_id: UUID):
    record = session.query(InternHistory).filter(InternHistory.intern_id == intern_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"No history found for intern ID: {intern_id}")
    return record


def getInternHistoryBySchool(session: Session, school_name: str):
    records = session.query(InternHistory).filter(InternHistory.school_name == school_name).all()
    if not records:
        raise HTTPException(status_code=404, detail=f"No intern history found for school: {school_name}")
    return records


def transferSchoolToHistory(session: Session, school_name: str):
    #Check if any interns from this school are still Active
    active_interns = session.query(Intern).filter(
        Intern.school_name == school_name,
        Intern.status.notin_(["Completed", "Terminated"])
    ).count()

    if active_interns > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Not all interns from {school_name} are done yet. {active_interns} remaining."
        )

    #Get all interns that are Completed or Terminated
    finished_interns = session.query(Intern).filter(
        Intern.school_name == school_name,
        Intern.status.in_(["Completed", "Terminated"])
    ).all()

    if not finished_interns:
        raise HTTPException(status_code=404, detail="No finished interns to transfer.")

    #Transfer each to intern_history
    for intern in finished_interns:
        # Convert INTERVAL to total hours (Integer)
        required_hours = int(intern.total_hours.total_seconds() / 3600) if intern.total_hours else 0

        if intern.time_in and intern.time_out:
            shift_time = f"{intern.time_in.strftime('%I:%M %p')} - {intern.time_out.strftime('%I:%M %p')}"
        else:
            shift_time = "Not Set"

        #Get latest attendance record to determine end_date
        last_attendance = (
            session.query(Attendance)
            .filter(Attendance.intern_id == intern.intern_id)
            .order_by(Attendance.attendance_date.desc())
            .first()
        )

        #Use created_at as start_date and latest time_out as end_date
        start_date = intern.created_at.date() if intern.created_at else datetime.now().date()
        end_date = (
            last_attendance.time_out.date()
            if last_attendance and last_attendance.time_out
            else datetime.now().date()
        )

        #Create InternHistory entry
        history_record = InternHistory(
            intern_id=intern.intern_id,
            intern_name=intern.intern_name,
            school_name=intern.school_name,
            start_date=start_date,
            end_date=end_date,
            shift_time=shift_time,
            coordinator_name=intern.coordinator_name if hasattr(intern, "coordinator_name") and intern.coordinator_name else "Not Assigned",
            total_required_hours=required_hours,
            status=intern.status
        )
        session.add(history_record)
        session.delete(intern)

    session.commit()
    return {"message": f"Transferred {len(finished_interns)} interns from {school_name} to intern history."}


def deleteOldInternHistory(session: Session):
    # Records older than 30 days from today
    threshold = datetime.now() - timedelta(days=30)

    old_records = session.query(InternHistory).filter(
        InternHistory.end_date < threshold.date()
    ).all()

    deleted_count = len(old_records)

    for record in old_records:
        session.delete(record)

    session.commit()
    return {"message": f"Deleted {deleted_count} intern history records older than 30 days."}

from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta
from app.models.intern_model import Intern
from app.models.intern_history_model import InternHistory
from uuid import UUID


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
    # Check if all interns from this school are done
    active_interns = session.query(Intern).filter(
        Intern.school_name == school_name,
        Intern.status.notin_(["Completed", "Terminated"])
    ).count()

    if active_interns > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Not all interns from {school_name} are done yet. {active_interns} remaining."
        )

    # Get all finished interns from this school
    finished_interns = session.query(Intern).filter(
        Intern.school_name == school_name,
        Intern.status.in_(["Completed", "Terminated"])
    ).all()

    if not finished_interns:
        raise HTTPException(status_code=404, detail="No finished interns to transfer.")

    # Transfer to intern_history
    for intern in finished_interns:
        history_record = InternHistory(
            intern_id=intern.intern_id,
            intern_name=intern.intern_name,
            school_name=intern.school_name,
            internship_start_date=intern.created_at.date(),
            internship_end_date=intern.updated_at.date(),
            shift_time=f"{intern.time_in.strftime('%I:%M %p')} - {intern.time_out.strftime('%I:%M %p')}",
            coordinator_name="Not Assigned",  # Replace if coordinator tracking exists
            total_required_hours=intern.total_hours,
            status=intern.status,
        )
        session.add(history_record)

    session.commit()
    return {"message": f"Transferred {len(finished_interns)} interns from {school_name} to intern history."}


def deleteOldInternHistory(session: Session):
    threshold = datetime.now() - timedelta(days=30)
    old_records = session.query(InternHistory).filter(
        InternHistory.internship_end_date < threshold.date()
    ).all()

    deleted_count = len(old_records)

    for record in old_records:
        session.delete(record)

    session.commit()
    return {"message": f"Deleted {deleted_count} intern history records older than 30 days."}

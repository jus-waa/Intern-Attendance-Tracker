from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta
from uuid import UUID
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.models.intern_history_model import InternHistory
from app.models.intern_model import Intern
from app.schemas.intern_history_schema import InternHistorySchema

def getAllInternHistory(session: Session, skip: int = 0, limit: int = 100):
    #get all interns that are Completed or Terminated
    finished_interns = session.query(InternHistory).filter(
        InternHistory.status.in_(["Completed", "Terminated"])
    ).offset(skip).limit(limit).all()

    if not finished_interns:
        raise HTTPException(status_code=404, detail=f"No intern history found.")
    return finished_interns

def getInternHistoryById(session: Session, intern_id: UUID):
    record = session.query(InternHistory).filter(InternHistory.intern_id == intern_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"No history found for intern ID: {intern_id}")
    return record


def getInternHistoryBySchool(session: Session, abbreviation: str):
    #get all interns that are Completed or Terminated
    finished_interns = session.query(InternHistory).filter(
        InternHistory.abbreviation == abbreviation,
    ).all()

    if not finished_interns:
        raise HTTPException(status_code=404, detail=f"No intern history found for school: {abbreviation}")
    return finished_interns


def transferAllSchoolsToHistory(session: Session):
    try:
        # Get all unique school abbreviations in interns table
        abbreviations = session.query(Intern.abbreviation).distinct().all()
        abbreviations = [abbr[0] for abbr in abbreviations]  # unpack tuples

        transferred_summary = {}

        for abbreviation in abbreviations:
            # Check if any interns are still active for this school
            active_interns = session.query(Intern).filter(
                Intern.abbreviation == abbreviation,
                Intern.status.notin_(["Completed", "Terminated"])
            ).count()

            if active_interns > 0:
                continue  # skip schools that still have active interns

            # Get all completed/terminated interns
            finished_interns = session.query(Intern).filter(
                Intern.abbreviation == abbreviation,
                Intern.status.in_(["Completed", "Terminated"])
            ).all()

            if not finished_interns:
                continue

            # Transfer each intern to history
            for intern in finished_interns:
                history = InternHistory(
                    intern_id=intern.intern_id,
                    intern_name=intern.intern_name,
                    school_name=intern.school_name,
                    abbreviation=intern.abbreviation,
                    shift_name=intern.shift_name,
                    total_hours=intern.total_hours,
                    status=intern.status
                )
                session.add(history)

            # Delete from intern table
            for intern in finished_interns:
                session.delete(intern)

            transferred_summary[abbreviation] = len(finished_interns)

        session.commit()

        return {
            "message": "Auto-transferred completed/terminated interns for eligible schools.",
            "transferred": transferred_summary
        }

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Database error during transfer: {str(e)}")
    
def deleteAllBySchool(session: Session, abbreviation: str):
    _intern_history = getInternHistoryBySchool(session=session, abbreviation=abbreviation)
    
    for intern in _intern_history:
        session.delete(intern)
    
    session.commit()
    
    return {"message": f"Interns from {abbreviation} deleted successfully."}
    
    
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

from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.utils.db import SessionLocal

def auto_timeout():
    session: Session = SessionLocal()
    try:
        now = datetime.now()

        records = session.query(Attendance).join(Intern).filter(
            Attendance.time_in.isnot(None),
            Attendance.time_out.is_(None)
        ).all()

        for attendance in records:
            intern = attendance.intern  # via relationship

            # Build scheduled shift end datetime
            scheduled_end = datetime.combine(
                attendance.attendance_date, intern.time_out
            )

            # If shift passes midnight, move end to next day
            if intern.time_out < intern.time_in:
                scheduled_end += timedelta(days=1)

            # Auto-timeout if current time passed scheduled end
            if now >= scheduled_end:
                attendance.time_out = scheduled_end
                attendance.total_hours = scheduled_end - attendance.time_in
                attendance.timeout_type = "auto"

        session.commit()
        print(f"{len(records)} records auto-checked out.")
    finally:
        session.close()

# auto_timeout.py
from datetime import datetime, date, time
from sqlalchemy.orm import Session
from app.models.attendance_model import Attendance  # Update to your actual path
from app.utils.db import SessionLocal  # Your DB session

def auto_timeout():
    session: Session = SessionLocal()
    try:
        current_time = datetime.now().time()

        records = session.query(Attendance).filter(
            Attendance.attendance_date == date.today(),
            Attendance.time_in.isnot(None),
            Attendance.time_out.is_(None)
        ).all()

        for attendance in records:
            time_in_datetime = datetime.combine(date.today(), attendance.time_in)
            time_out_datetime = datetime.combine(date.today(), time(23, 59, 59))
            total_duration = time_out_datetime - time_in_datetime
            attendance.time_out = time(23, 59, 59)
            attendance.total_hours = total_duration.total_seconds() / 3600

        session.commit()
        print(f"{len(records)} records auto-checked out.")
    finally:
        session.close()

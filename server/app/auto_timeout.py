from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models.attendance_model import Attendance
from app.utils.db import SessionLocal

def auto_timeout():
    session: Session = SessionLocal()
    try:
        current_time = datetime.now()

        records = session.query(Attendance).filter(
            Attendance.attendance_date == date.today(),
            Attendance.time_in.isnot(None),
            Attendance.time_out.is_(None)
        ).all()

        for attendance in records:
            # Use datetime, not time
            time_in_datetime = attendance.time_in
            time_out_datetime = attendance.time_in # full timestamp

            total_duration = time_out_datetime - time_in_datetime

            attendance.time_out = time_out_datetime  # now correct type (timestamp)
            attendance.total_hours = total_duration  # works if total_hours is INTERVAL
            attendance.remarks = "Didn't Timeout"

        session.commit()
        print(f"{len(records)} records auto-checked out.")
    finally:
        session.close()

from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.utils.db import SessionLocal
import pytz

TIMEZONE = pytz.timezone("Asia/Manila")

# ------------------------------
# AUTO TIMEOUT
# ------------------------------
def auto_timeout():
    session: Session = SessionLocal()
    try:
        now = datetime.now(TIMEZONE)
        interns = session.query(Intern).all()
        auto_timeout_count = 0

        for intern in interns:
            today = now.date()
            shift_start = datetime.combine(today, intern.time_in, tzinfo=TIMEZONE)
            shift_end = datetime.combine(today, intern.time_out, tzinfo=TIMEZONE)

            # Night shift → ends next day
            if intern.time_out < intern.time_in:
                shift_end += timedelta(days=1)
                if now < shift_start:
                    shift_start -= timedelta(days=1)

            attendance_date = shift_start.date()

            # Get the attendance for this shift
            attendance = session.query(Attendance).filter(
                Attendance.intern_id == intern.intern_id,
                Attendance.attendance_date == attendance_date,
                Attendance.time_in.isnot(None),
                Attendance.time_out.is_(None)
            ).first()

            # Auto-timeout at shift end
            if attendance and now >= shift_end:
                attendance.time_out = shift_end
                attendance.total_hours = attendance.time_out - attendance.time_in
                attendance.remarks = "Auto Timeout"
                auto_timeout_count += 1

        session.commit()
        print(f"{auto_timeout_count} records auto-timed out.")

    except Exception as e:
        print(f"Error in auto_timeout: {e}")
    finally:
        session.close()
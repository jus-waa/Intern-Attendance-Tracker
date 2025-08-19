from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.utils.db import SessionLocal

def auto_timeout():
    session: Session = SessionLocal()
    try:
        now = datetime.now()
        today = date.today()

        # Get all interns to check their shift times
        interns = session.query(Intern).all()

        auto_timeout_count = 0

        for intern in interns:
            # Calculate the auto-timeout threshold (5 mins before next shift)
            shift_start = datetime.combine(today, intern.time_in)
            next_shift_start = shift_start + timedelta(days=1)  # next day shift
            auto_timeout_threshold = next_shift_start - timedelta(minutes=5)

            # Find today's attendance record where time_out is still None
            attendance = session.query(Attendance).filter(
                Attendance.intern_id == intern.intern_id,
                Attendance.attendance_date == today,
                Attendance.time_in.isnot(None),
                Attendance.time_out.is_(None)
            ).first()

            # Auto-timeout only if we're within the last 5 mins before next shift
            if attendance and now >= auto_timeout_threshold:
                attendance.time_out = now
                attendance.total_hours = now - attendance.time_in
                attendance.remarks = "Didn't Timeout"
                auto_timeout_count += 1

        session.commit()
        print(f"{auto_timeout_count} records auto-timed out.")

    except Exception as e:
        print(f"Error in auto_timeout: {e}")

    finally:
        session.close()

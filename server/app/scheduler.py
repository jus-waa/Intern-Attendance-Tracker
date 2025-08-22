from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern
from app.utils.db import SessionLocal
import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

TIMEZONE = pytz.timezone("Asia/Manila")

# ------------------------------
# MARK ABSENT
# ------------------------------
def mark_absent():
    session: Session = SessionLocal()
    try:
        now = datetime.now(TIMEZONE)
        interns = session.query(Intern).all()

        for intern in interns:
            # Determine the shift start datetime
            today = now.date()
            shift_start = datetime.combine(today, intern.time_in, tzinfo=TIMEZONE)

            # If night shift and current time before shift start, use yesterday
            if intern.time_out < intern.time_in and now < shift_start:
                shift_start -= timedelta(days=1)

            attendance_date = shift_start.date()

            # Check if attendance already exists
            attendance = session.query(Attendance).filter(
                Attendance.intern_id == intern.intern_id,
                Attendance.attendance_date == attendance_date
            ).first()

            if not attendance:
                new_attendance = Attendance(
                    intern_id=intern.intern_id,
                    intern_name=intern.intern_name,
                    abbreviation=intern.abbreviation,
                    attendance_date=attendance_date,
                    check_in="Absent"
                )
                session.add(new_attendance)

        session.commit()
        print(f"[{now.date()}] Absent check completed.")

    except Exception as e:
        print(f"Error in mark_absent: {e}")
    finally:
        session.close()


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


# ------------------------------
# SCHEDULER
# ------------------------------
def start_scheduler():
    scheduler = BackgroundScheduler(timezone=TIMEZONE)
    db: Session = SessionLocal()
    try:
        interns = db.query(Intern).all()

        for intern in interns:
            # Schedule mark_absent at shift start
            scheduler.add_job(
                mark_absent,
                CronTrigger(
                    hour=intern.time_in.hour,
                    minute=intern.time_in.minute,
                    timezone=TIMEZONE
                ),
                id=f"mark_absent_{intern.intern_id}"
            )

            # Schedule auto_timeout at shift end
            shift_end_hour = intern.time_out.hour
            shift_end_minute = intern.time_out.minute
            scheduler.add_job(
                auto_timeout,
                CronTrigger(
                    hour=shift_end_hour,
                    minute=shift_end_minute,
                    timezone=TIMEZONE
                ),
                id=f"auto_timeout_{intern.intern_id}"
            )

    finally:
        db.close()

    scheduler.start()

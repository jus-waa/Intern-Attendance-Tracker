from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from app.auto_timeout import auto_timeout
from datetime import date
import pytz

from app.utils.db import SessionLocal
from app.models.attendance_model import Attendance
from app.models.intern_model import Intern

def mark_absent():
    db: Session = SessionLocal()
    try:
        today = date.today()
        interns = db.query(Intern).all()

        for intern in interns:
            attendance = db.query(Attendance).filter(
                Attendance.intern_id == intern.intern_id,
                Attendance.attendance_date == today,
                Attendance.abbreviation == intern.abbreviation,
                Attendance.intern_name == intern.intern_name
            ).first()

            if not attendance:
                new_attendance = Attendance(
                    intern_id=intern.intern_id,
                    intern_name=intern.intern_name,
                    abbreviation=intern.abbreviation,
                    attendance_date=today,
                    check_in="Absent"
                )
                db.add(new_attendance)

        db.commit()
        print(f"[{today}] Absent check completed.")
    except Exception as e:
        print(f"Error marking absences: {e}")
    finally:
        db.close()
        
def refresh_jobs(scheduler):
    db: Session = SessionLocal()
    try:
        interns = db.query(Intern).all()

        for intern in interns:
            absent_job_id = f"mark_absent_{intern.intern_id}"
            timeout_job_id = f"auto_timeout_{intern.intern_id}"

            if not scheduler.get_job(absent_job_id):
                scheduler.add_job(
                    mark_absent,
                    CronTrigger(hour=intern.time_in.hour, minute=intern.time_in.minute, timezone=pytz.timezone("Asia/Manila")),
                    id=absent_job_id
                )

            if not scheduler.get_job(timeout_job_id):
                scheduler.add_job(
                    auto_timeout,
                    CronTrigger(hour=intern.time_out.hour, minute=intern.time_out.minute, timezone=pytz.timezone("Asia/Manila")),
                    id=timeout_job_id
                )

    finally:
        db.close()
        
def start_scheduler():
    scheduler = BackgroundScheduler(timezone=pytz.timezone("Asia/Manila"))

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
                    timezone=pytz.timezone("Asia/Manila")
                ),
                id=f"mark_absent_{intern.intern_id}"
            )

            # Determine shift end (handle next-day shifts)
            shift_end_hour = intern.time_out.hour
            shift_end_minute = intern.time_out.minute
            if intern.time_out < intern.time_in:
                # Shift passes midnight → we’ll schedule next day
                # APScheduler cron doesn't allow "next day" directly,
                # but this works since time is still valid
                pass

            scheduler.add_job(
                auto_timeout,
                CronTrigger(
                    hour=shift_end_hour,
                    minute=shift_end_minute,
                    timezone=pytz.timezone("Asia/Manila")
                ),
                id=f"auto_timeout_{intern.intern_id}"
            )

    finally:
        db.close()

    scheduler.start()
    
    refresh_jobs(scheduler)

    # Refresh every 5 minutes for new interns
    scheduler.add_job(lambda: refresh_jobs(scheduler), 'interval', minutes=5)

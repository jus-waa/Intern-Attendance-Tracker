from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
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
                Attendance.attendance_date == today
            ).first()

            if not attendance:
                new_attendance = Attendance(
                    intern_id=intern.intern_id,
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

def start_scheduler():
    scheduler = BackgroundScheduler(timezone=pytz.timezone("Asia/Manila"))
    trigger = CronTrigger(hour=4, minute=0) #Runs by 4 AM
    scheduler.add_job(mark_absent, trigger)
    scheduler.start()

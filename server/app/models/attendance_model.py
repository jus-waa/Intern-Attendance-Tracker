from sqlalchemy import Column, Integer, String, Time, Date, Interval, ForeignKey, text, UUID
from app.utils.db import Base
class Attendance(Base):
    __tablename__= "attendance"
    
    attendance_id=Column(Integer, autoincrement=True, primary_key=True)
    intern_id=Column(UUID, ForeignKey("intern.intern_id"))
    attendance_date=Column(Date, server_default=text('CURRENT_DATE'))
    time_in=Column(Time)
    time_out=Column(Time)
    total_hours=Column(Interval)
    check_in=Column(String(255))
    remarks=Column(String(255))
    
def __repr__(self):
    return f"<Attendance(attendance_id={self.attendance.id}, intern={self.attendance.name})"
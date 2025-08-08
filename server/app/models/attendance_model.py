from sqlalchemy import Column, Integer, String, Time, Date, Interval, ForeignKey, text, UUID, TIMESTAMP
from sqlalchemy.orm import relationship
from app.utils.db import Base
class Attendance(Base):
    __tablename__= "attendance"
    
    attendance_id=Column(Integer, autoincrement=True, primary_key=True)
    intern_id=Column(UUID, ForeignKey("intern.intern_id", ondelete="CASCADE"))
    attendance_date=Column(Date, server_default=text('CURRENT_DATE'))
    abbreviation=Column(String(255))
    time_in=Column(TIMESTAMP(timezone=True)) 
    time_out=Column(TIMESTAMP(timezone=True)) 
    total_hours=Column(Interval)
    check_in=Column(String(255))
    remarks=Column(String(255))
    updated_at=Column(TIMESTAMP(timezone=True), server_default=text('now()')) 
    
    #defining relationship from intern_model
    intern = relationship("Intern", back_populates="attendances")
    
def __repr__(self):
    return f"<Attendance(attendance_id={self.attendance.id}, intern={self.attendance.name})"
from sqlalchemy import Column, Integer, String, Time, TIMESTAMP, Interval, text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.utils.db import Base

class Intern(Base):
    __tablename__ = "intern" #maps this to the intern table in postgresql
    
    intern_id=Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) 
    intern_name=Column(String(255), nullable=False)
    school_name=Column(String(255))
    shift_name=Column(String(255))
    start_date=Column(Date)
    end_date=Column(Date)
    time_in=Column(Time)
    time_out=Column(Time)
    total_hours=Column(Interval)
    time_remain=Column(Interval)
    status=Column(String(255))
    created_at=Column(TIMESTAMP(timezone=True), server_default=text('now()'))
    updated_at=Column(TIMESTAMP(timezone=True), server_default=text('now()')) 

    #defining relationship to attendance_model
    attendances =  relationship("Attendance", back_populates="intern")
#used for debugging
def __repr__(self):
    return f"<Intern(intern_id={self.intern.id}, intern_name={self.intern.name})>"
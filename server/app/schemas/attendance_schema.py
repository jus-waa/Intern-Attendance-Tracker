from typing import Optional, Generic, TypeVar
from datetime import time, timedelta, date
from pydantic import BaseModel, Field
from uuid import UUID

T = TypeVar('T')    

class AttendanceSchema(BaseModel):
    attendance_id: Optional[int] = None
    intern_id: UUID
    attendance_date: Optional[date] = None
    time_in: time
    time_out: Optional[time] = None
    total_hours: Optional[timedelta] = None
    check_in: Optional[str] = None
    remarks: Optional[str] = None
    
    class Config:
        from_attributes = True

class InternSchema(BaseModel):
    school_name: str
    
    class Config:
        from_attributes = True

#used for inputting values
class ReqAttendance(BaseModel):
    attendance_id: Optional[int] = None
    intern_id: UUID
    attendance_date: Optional[date] = None
    time_in: Optional[time] = None
    time_out: time
    total_hours: timedelta
    check_in: str
    remarks: str
    intern: InternSchema #allows access to fk intern (remember this)
        
class ReqClockIn(BaseModel):
    intern_id: UUID
    
class ReqUpdateAttendance(BaseModel):
    time_out: time
    total_hours: timedelta
    check_in: str
    remarks: str
#response for any type of data
#similar to status.json in express
class ResAttendance(BaseModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]
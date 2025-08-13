from typing import Optional, Generic, TypeVar
from datetime import time, timedelta, date, datetime
from pydantic import BaseModel, Field
from uuid import UUID

T = TypeVar('T')    

class AttendanceSchema(BaseModel):
    attendance_id: Optional[int] = None
    intern_id: UUID
    attendance_date: Optional[date] = None
    intern_name: Optional[str]
    abbreviation: Optional[str]
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    total_hours: Optional[timedelta] = None
    check_in: Optional[str] = None
    remarks: Optional[str] = None
    updated_at: Optional[time] = None
    
    class Config:
        from_attributes = True

class InternSchema(BaseModel):
    school_name: str
    
    class Config:
        from_attributes = True

class ReqInternID(BaseModel):
    intern_id: UUID

class ReqUpdateAttendance(BaseModel):
    intern_id: UUID
    time_out: Optional[time] = None
    remarks: str
#response for any type of data
#similar to status.json in express
class ResAttendance(BaseModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]
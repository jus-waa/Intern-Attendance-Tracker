from typing import Optional, Generic, TypeVar
from datetime import time, timedelta, date
from pydantic import BaseModel, Field
from uuid import UUID

T = TypeVar('T')    

class AttendanceSchema(BaseModel):
    attendance_id: Optional[int] = None
    intern_id: Optional[UUID] = None
    attendance_date: Optional[date] = None
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    total_hours: Optional[timedelta] = None
    check_in: Optional[str] = None
    remarks: Optional[str] = None
    
    class Config:
        from_attributes = True

#used for inputting values
class ReqAttendance(BaseModel):
    parameter: AttendanceSchema = Field(...)
    
#response for any type of data
#similar to status.json in express
class ResAttendance(BaseModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]
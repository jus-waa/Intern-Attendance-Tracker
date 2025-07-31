from typing import Optional, Generic, TypeVar
from datetime import time, timedelta, datetime
from pydantic import BaseModel, Field

T = TypeVar('T')    

class AttendanceSchema(BaseModel):
    attendance_id: Optional[int] = None
    intern_id: Optional[int] = None
    attendance_date: Optional[datetime] = None
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
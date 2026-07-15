from typing import Optional, Generic, TypeVar
from datetime import time, timedelta, datetime, date
from uuid import UUID
from pydantic import BaseModel, Field

T = TypeVar('T')    

#Intern schema based on db
class InternSchema(BaseModel):
    intern_name: str
    school_name: str
    abbreviation: str
    shift_name: str
    time_in: time
    time_out: time
    total_hours: timedelta
    time_remain: Optional[timedelta] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

#used for inputting values
class ReqIntern(BaseModel):
    intern_id: UUID
    intern_name: str
    school_name: str
    abbreviation: str
    shift_name: str
    time_in: time
    time_out: time
    total_hours: Optional[timedelta] = None
    time_remain: Optional[timedelta] = None
    status: str
    
class ReqInternID(BaseModel):
    intern_id: UUID
    
#response for any type of data
#similar to status.json in express
class ResIntern(BaseModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]
    
    
    
from typing import Optional, Generic, TypeVar
from datetime import time, timedelta, datetime
from uuid import UUID
from pydantic import BaseModel, Field

T = TypeVar('T')    

#Intern schema based on db
class InternSchema(BaseModel):
    intern_id: Optional[UUID] = None
    intern_name: Optional[str] = None
    school_name: Optional[str] = None
    shift_name: Optional[str] = None
    time_in: Optional[time] = None
    time_out: Optional[time] = None
    total_hours: Optional[timedelta] = None
    time_remain: Optional[timedelta] = None
    status: Optional[str] = None
    qr_code: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

#used for inputting values
class ReqIntern(BaseModel):
    parameter: InternSchema = Field(...)
    
#response for any type of data
#similar to status.json in express
class ResIntern(BaseModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]
    
    
    
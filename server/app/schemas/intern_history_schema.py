from typing import Optional, Generic, TypeVar
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel

T = TypeVar('T')

class InternHistorySchema(BaseModel):
    intern_id: UUID
    intern_name: str
    school_name: str
    start_date: date
    end_date: date
    shift_time: str
    coordinator_name: str
    total_required_hours: int  # FIXED: must match Integer in model
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# If you want to POST by school (optional)
class ReqTransferInternHistory(BaseModel):
    school_name: str


# Generic API response
class ResInternHistory(BaseModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]

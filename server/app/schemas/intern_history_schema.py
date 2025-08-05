from typing import Optional, Generic, TypeVar
from datetime import date, timedelta, datetime
from pydantic import BaseModel, Field
from app.schemas.intern_history_schema import InternHistorySchema, ResInternHistory

from uuid import UUID

T = TypeVar('T')


class InternHistorySchema(BaseModel):
    intern_id: UUID
    intern_name: str
    school_name: str
    internship_start_date: date
    internship_end_date: date
    shift_time: str
    coordinator_name: str
    total_required_hours: timedelta
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Request model is optional since we auto-transfer based on logic
# But if needed:
class ReqTransferInternHistory(BaseModel):
    school_name: str


# Generic response structure
class ResInternHistory(BaseModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]

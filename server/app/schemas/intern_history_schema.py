from typing import Optional, Generic, TypeVar
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel

T = TypeVar('T')

class InternHistorySchema(BaseModel):
    intern_id: UUID
    intern_name: str
    school_name: str
    abbreviation: str
    shift_name: str
    total_hours: int 
    status: str

    class Config:
        from_attributes = True

class ReqTransferInternHistory(BaseModel):
    abbreviation: str

class ResInternHistory(BaseModel, Generic[T]):
    code: str
    status: str
    message: str
    result: Optional[T]

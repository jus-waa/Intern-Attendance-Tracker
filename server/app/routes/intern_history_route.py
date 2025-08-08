from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict
from collections import defaultdict
from app.utils.db import get_db
from app.schemas.intern_history_schema import InternHistorySchema, ResInternHistory, ReqTransferInternHistory
from app.crud import intern_history
from app.utils.helper import convert_total_hours

router = APIRouter()

@router.get("/list")
async def getAll(session: Session = Depends(get_db)):
    result = intern_history.getAllInternHistory(session)
    result = convert_total_hours(result)
    return ResInternHistory(
        code="200",
        status="Ok",
        message="All intern history fetched successfully.",
        result=result
    ).model_dump(exclude_none=True)

#get all intern histories for a given school
@router.get("/school/{abbreviation}")
async def getBySchool(abbreviation: str, session: Session = Depends(get_db)):
    result = intern_history.getInternHistoryBySchool(session, abbreviation)
    result = convert_total_hours(result)
    return ResInternHistory(
        code="200",
        status="Ok",
        message=f"Intern history from {abbreviation} fetched successfully.",
        result=result
    ).model_dump(exclude_none=True)

#archive interns from a school (only when all are completed/terminated)
@router.post("/transfer/{abbreviation}")
async def transferCompletedToHistory(abbreviation: str, session: Session = Depends(get_db)):
    result = intern_history.transferSchoolToHistory(session, abbreviation)
    return ResInternHistory(
        code="201",
        status="Created",
        message=result["message"],
        result=result["message"]
    ).model_dump(exclude_none=True)

@router.delete("/school/delete")
async def removeHistoryBySchool(request: ReqTransferInternHistory, session: Session=Depends(get_db)):
    _intern_history = intern_history.deleteAllBySchool(session, abbreviation=request.abbreviation)
    return ResInternHistory(code="200",
                     status="Ok",
                     message="Intern Information removed successfully.",
                     result=_intern_history
                     ).model_dump(exclude_none=True)

#delete intern histories older than 1 month
@router.delete("/expired", response_model=ResInternHistory[str])
async def removeExpiredHistory(session: Session = Depends(get_db)):
    result = intern_history.deleteOldInternHistory(session)
    return ResInternHistory(
        code="200",
        status="Ok",
        message=result["message"],
        result=result["message"]
    ).model_dump(exclude_none=True)

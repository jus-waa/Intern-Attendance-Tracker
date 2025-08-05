from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.utils.db import get_db
from app.schemas.intern_history_schema import InternHistorySchema, ResInternHistory
from app.crud import intern_history

router = APIRouter()

@router.get("/history")
async def getAll(session: Session = Depends(get_db)):
    result = intern_history.getAllInternHistory(session)
    return ResInternHistory(
        code="200",
        status="Ok",
        message="All intern history fetched successfully.",
        result=result
    ).model_dump(exclude_none=True)


@router.get("/history/{intern_id}")
async def getById(intern_id: UUID, session: Session = Depends(get_db)):
    result = intern_history.getInternHistoryById(session, intern_id)
    return ResInternHistory(
        code="200",
        status="Ok",
        message="Intern history fetched successfully.",
        result=result
    ).model_dump(exclude_none=True)


@router.get("/history/school/{school_name}")
async def getBySchool(school_name: str, session: Session = Depends(get_db)):
    result = intern_history.getInternHistoryBySchool(session, school_name)
    return ResInternHistory(
        code="200",
        status="Ok",
        message=f"Intern history from {school_name} fetched successfully.",
        result=result
    ).model_dump(exclude_none=True)


@router.post("/history/transfer/{school_name}")
async def transferCompletedToHistory(school_name: str, session: Session = Depends(get_db)):
    result = intern_history.transferSchoolToHistory(session, school_name)
    return ResInternHistory(
        code="201",
        status="Created",
        message=result["message"],
        result=result["message"]
    ).model_dump(exclude_none=True)


@router.delete("/history/expired")
async def removeExpiredHistory(session: Session = Depends(get_db)):
    result = intern_history.deleteOldInternHistory(session)
    return ResInternHistory(
        code="200",
        status="Ok",
        message=result["message"],
        result=result["message"]
    ).model_dump(exclude_none=True)

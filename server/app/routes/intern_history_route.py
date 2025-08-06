from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict
from collections import defaultdict

from app.utils.db import get_db
from app.schemas.intern_history_schema import InternHistorySchema, ResInternHistory
from app.crud import intern_history

router = APIRouter()

@router.get("/history", response_model=ResInternHistory[List[InternHistorySchema]])
async def getAll(session: Session = Depends(get_db)):
    result = intern_history.getAllInternHistory(session)
    return ResInternHistory(
        code="200",
        status="Ok",
        message="All intern history fetched successfully.",
        result=result
    ).model_dump(exclude_none=True)

# 🔹 NEW: Get all intern history records grouped by school
@router.get("/grouped", response_model=ResInternHistory[Dict[str, List[InternHistorySchema]]])
async def getGroupedBySchool(session: Session = Depends(get_db)):
    interns = intern_history.getAllInternHistory(session)
    
    grouped = defaultdict(list)
    for intern in interns:
        grouped[intern.school_name].append(intern)

    return ResInternHistory(
        code="200",
        status="Ok",
        message="Intern history grouped by school fetched successfully.",
        result=dict(grouped)
    ).model_dump(exclude_none=True)

@router.get("/{intern_id}", response_model=ResInternHistory[InternHistorySchema])
async def getById(intern_id: UUID, session: Session = Depends(get_db)):
    result = intern_history.getInternHistoryById(session, intern_id)
    return ResInternHistory(
        code="200",
        status="Ok",
        message="Intern history fetched successfully.",
        result=result
    ).model_dump(exclude_none=True)

# 🔹 Get all intern histories for a given school
@router.get("/school/{school_name}", response_model=ResInternHistory[List[InternHistorySchema]])
async def getBySchool(school_name: str, session: Session = Depends(get_db)):
    result = intern_history.getInternHistoryBySchool(session, school_name)
    return ResInternHistory(
        code="200",
        status="Ok",
        message=f"Intern history from {school_name} fetched successfully.",
        result=result
    ).model_dump(exclude_none=True)

# 🔹 Archive interns from a school (only when all are completed/terminated)
@router.post("/transfer/{school_name}", response_model=ResInternHistory[str])
async def transferCompletedToHistory(school_name: str, session: Session = Depends(get_db)):
    result = intern_history.transferSchoolToHistory(session, school_name)
    return ResInternHistory(
        code="201",
        status="Created",
        message=result["message"],
        result=result["message"]
    ).model_dump(exclude_none=True)

# 🔹 Delete intern histories older than 1 month
@router.delete("/expired", response_model=ResInternHistory[str])
async def removeExpiredHistory(session: Session = Depends(get_db)):
    result = intern_history.deleteOldInternHistory(session)
    return ResInternHistory(
        code="200",
        status="Ok",
        message=result["message"],
        result=result["message"]
    ).model_dump(exclude_none=True)

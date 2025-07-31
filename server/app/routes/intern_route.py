from fastapi import APIRouter, HTTPException, Path, Depends
from app.utils.db import SessionLocal, get_db
from sqlalchemy.orm import Session
from app.schemas.intern_schema import InternSchema, ReqIntern, ResIntern 
from app.utils.qr_generator import generateQrCode
from app.crud import intern
from uuid import UUID

import os

router = APIRouter()

#http methods
@router.post("/register")
async def create(request:ReqIntern, session:Session=Depends(get_db)):
    _intern = intern.createIntern(session, intern=request.parameter)
    intern_uuid = _intern.intern_id
    request.parameter.qr_code = generateQrCode(str(intern_uuid), filename=str(intern_uuid))
    return ResIntern(code="201", 
                     status="Created", 
                     message="Intern added successfully.", 
                     result={
                        "uuid": str(intern_uuid),
                        "qr_code_path": request.parameter.qr_code 
                        }).model_dump(exclude_none=True)

@router.get("/list")
async def getAll(session:Session=Depends(get_db)):
    _intern = intern.getAllIntern(session, 0, 100)
    return ResIntern(code="200",
                     status="Ok",
                     message="Intern information fetched successfully.",
                     result=_intern
                     ).model_dump(exclude_none=True)

@router.get("/list/id:{id}")
async def get(id:UUID, session:Session=Depends(get_db)):
    _intern = intern.getInternById(session, id)
    return ResIntern(code="200",
                     status="Ok",
                     message="Intern id:{id} fetched successfully.",
                     result=_intern
                     ).model_dump(exclude_none=True)

@router.delete("/remove")
async def removeIntern(request:ReqIntern, session:Session=Depends(get_db)):
    path = f"qrcodes/{request.parameter.intern_id}.png"
    os.remove(path)
    _intern = intern.removeIntern(session, intern_id=request.parameter.intern_id)
    return ResIntern(code="200",
                     status="Ok",
                     message="Intern Information removed successfully.",
                     result=_intern
                     ).model_dump(exclude_none=True)

@router.patch("/update")
async def update(request:ReqIntern, session:Session=Depends(get_db)):
    _intern = intern.updateIntern(session, intern_id=request.parameter.intern_id,
                                  intern_name=request.parameter.intern_name,
                                  school_name=request.parameter.school_name,
                                  shift_name=request.parameter.shift_name,
                                  time_in=request.parameter.time_in,
                                  time_out=request.parameter.time_out,
                                  total_hours=request.parameter.total_hours,
                                  time_remain=request.parameter.time_remain,
                                  status=request.parameter.status,
                                  qr_code=request.parameter.qr_code,
                                  created_at=request.parameter.created_at,
                                  updated_at=request.parameter.updated_at
                                  )
    return ResIntern(code="200",
                     status="Updated",
                     message="Intern Information updated successfully.",
                     result=_intern
                     ).model_dump(exclude_none=True)


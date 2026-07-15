from fastapi import APIRouter, HTTPException, Path, Depends
from app.utils.db import SessionLocal, get_db
from sqlalchemy.orm import Session
from app.schemas.intern_schema import InternSchema, ReqIntern, ResIntern, ReqInternID
from app.utils.qr_generator import generateQrCode
from app.crud import intern
from uuid import UUID
from app.utils.helper import convert_total_hours_to_float, convert_total_hours_single

#sample change
import os

router = APIRouter()

#http methods
@router.post("/register")
async def create(request:InternSchema, session:Session=Depends(get_db)):
    _intern = intern.createIntern(session, intern=request)
    intern_uuid = _intern.intern_id
    qr_code = generateQrCode(str(intern_uuid), filename=str(intern_uuid))

    return ResIntern(code="201", 
                     status="Created", 
                     message="Intern added successfully.", 
                     result={ 
                        "uuid": str(intern_uuid),
                        "qr_code_path": qr_code 
                        }).model_dump(exclude_none=True)

@router.get("/list")
async def getAll(session:Session=Depends(get_db)):
    _intern = intern.getAllIntern(session, 0, 100)
    _intern = convert_total_hours_to_float(_intern)
    return ResIntern(code="200",
                     status="Ok",
                     message="Intern information fetched successfully.",
                     result=_intern
                     ).model_dump(exclude_none=True)

@router.get("/list/id:{id}")
async def get(id:UUID, session:Session=Depends(get_db)):
    _intern = intern.getInternById(session, id)
    _intern = convert_total_hours_single(_intern)
    return ResIntern(code="200",
                     status="Ok",
                     message="Intern id:{id} fetched successfully.",
                     result=_intern
                     ).model_dump(exclude_none=True)

@router.delete("/delete")
async def removeIntern(request:ReqInternID, session:Session=Depends(get_db)):
    path = f"qrcodes/{request.intern_id}.png"
    os.remove(path)
    _intern = intern.removeIntern(session, intern_id=request.intern_id)
    return ResIntern(code="200",
                     status="Ok",
                     message="Intern Information removed successfully.",
                     result=_intern
                     ).model_dump(exclude_none=True)
@router.patch("/update")
async def update(request:ReqIntern, session:Session=Depends(get_db)):
    _intern = intern.updateIntern(session,
                                  intern_id=request.intern_id,
                                  intern_name=request.intern_name,
                                  school_name=request.school_name,
                                  abbreviation=request.abbreviation,
                                  shift_name=request.shift_name,
                                  time_in=request.time_in,
                                  time_out=request.time_out,
                                  total_hours=request.total_hours,
                                  time_remain=request.time_remain,
                                  status=request.status,
                                  )
    _intern = convert_total_hours_single(_intern)
    return ResIntern(code="200",
                     status="Updated",
                     message="Intern Information updated successfully.",
                     result=_intern
                     ).model_dump(exclude_none=True)

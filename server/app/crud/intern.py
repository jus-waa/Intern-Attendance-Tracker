#basically "crud" for intern 
from sqlalchemy.orm import Session 
from fastapi import HTTPException
from app.models.intern_model import Intern
from app.schemas.intern_schema import InternSchema
from datetime import datetime, time, timedelta
from uuid import UUID

#in get all, use the built in pagination (skip, limit, offset)
def getAllIntern(session:Session, skip:int = 0, limit:int = 100):
    _intern = session.query(Intern).offset(skip).limit(limit).all()
    if not _intern:
        raise HTTPException(status_code=404, detail="No Interns found. ")
    return _intern
    
def getInternById(session:Session, intern_id: UUID):
    _intern = session.query(Intern).filter(Intern.intern_id == intern_id).first()
    if not _intern:
        raise HTTPException(status_code=404, detail=f"Intern with id:{intern_id} not found")
    return _intern

def getInternBySchool(session:Session, school_name: str):
    _intern = session.query(Intern).filter(Intern.school_name == school_name).first()
    if not _intern:
        raise HTTPException(status_code=404, detail=f"Intern from {school_name} not found")
    return _intern
        
#when creating, use the schema  
def createIntern(session:Session, intern: InternSchema):
    _intern = Intern(
        intern_name=intern.intern_name,
        school_name=intern.school_name,
        shift_name=intern.shift_name,
        time_in=intern.time_in,
        time_out=intern.time_out,
        total_hours=intern.total_hours,
        status=intern.status,
        qr_code=intern.qr_code,
        created_at=datetime.now(),
        updated_at=datetime.now()
        )
    session.add(_intern)
    session.commit()
    session.refresh(_intern)
    
    if not _intern:
        raise HTTPException(status_code=404, detail="Intern creation failed.")
    return _intern

def removeIntern(session:Session, intern_id: int):
    _intern = getInternById(session=session, intern_id=intern_id)
    session.delete(_intern)
    session.commit()
    
    if not _intern:
        raise HTTPException(status_code=404, detail="Failed to delete Intern. ")
    return {"message": f"Intern with id {intern_id} deleted successfully."}

def updateIntern(session:Session, intern_id: UUID,
                intern_name: str, 
                school_name: str, 
                shift_name: str, 
                time_in: time, 
                time_out: time, 
                total_hours: timedelta, 
                time_remain: timedelta, 
                status: str, 
                qr_code: str, 
                created_at: datetime, 
                updated_at: datetime):
    _intern = getInternById(session=session, intern_id=intern_id)
    
    _intern.intern_name=intern_name
    _intern.school_name=school_name
    _intern.shift_name=shift_name
    _intern.time_in=time_in
    _intern.time_out=time_out
    _intern.total_hours=total_hours
    _intern.time_remain=time_remain
    _intern.status=status
    _intern.qr_code=qr_code
    _intern.created_at=created_at
    _intern.updated_at=updated_at
    
    session.commit()
    session.refresh(_intern)
    
    if not _intern:
        raise HTTPException(status_code=404, detail="Update Intern failed.") 
    return _intern
    
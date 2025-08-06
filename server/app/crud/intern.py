#basically "crud" for intern 
from sqlalchemy import func
from sqlalchemy.orm import Session 
from fastapi import HTTPException
from app.models.intern_model import Intern
from app.schemas.intern_schema import InternSchema
from datetime import datetime, time, timedelta, date
from uuid import UUID

#in get all, use the built in pagination (skip, limit, offset)s
def getAllIntern(session:Session, skip:int = 0, limit:int = 100):
    interns = session.query(Intern).offset(skip).limit(limit).all()
    if not interns:
        raise HTTPException(status_code=404, detail="No Interns found. ")
    return interns

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
    validateIntern = session.query(Intern).filter(
        func.lower(Intern.intern_name) == intern.intern_name.lower(),
        func.lower(Intern.school_name) == intern.school_name.lower()
    ).first()
    
    if validateIntern:
        raise HTTPException(status_code=400, detail="Intern already exists.")
    
    time_remain_condition =  intern.time_remain if intern.time_remain is not None else intern.total_hours

    _intern = Intern(
        intern_name=intern.intern_name,
        school_name=intern.school_name,
        abbreviation=intern.abbreviation,
        shift_name=intern.shift_name,
        time_in=intern.time_in,
        time_out=intern.time_out,
        total_hours=intern.total_hours,
        time_remain=time_remain_condition,
        status=intern.status,
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

def updateIntern(session:Session,
                intern_id: UUID,
                intern_name: str, 
                school_name: str, 
                abbreviation: str,
                shift_name: str, 
                time_in: time, 
                time_out: time, 
                status: str, 
                ):
    _intern = getInternById(session=session, intern_id=intern_id)
    
    _intern.intern_name=intern_name
    _intern.school_name=school_name
    _intern.abbreviation=abbreviation
    _intern.shift_name=shift_name
    _intern.time_in=time_in
    _intern.time_out=time_out
    _intern.status=status
    _intern.updated_at=datetime.now()
    
    session.commit()
    session.refresh(_intern)
    
    if not _intern:
        raise HTTPException(status_code=404, detail="Update Intern failed.") 
    return _intern
    
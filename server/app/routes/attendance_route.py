from fastapi import APIRouter, Depends, HTTPException
from app.utils.db import get_db
from sqlalchemy.orm import Session
from app.schemas.attendance_schema import ResAttendance, ReqInternID, ReqUpdateAttendance, AttendanceSchema
from app.crud import attendance
from datetime import date, datetime
from app.models.attendance_model import Attendance
from app.utils.helper import convert_total_hours


router = APIRouter()

@router.post("/check-in")
async def checkInAttendance(request:ReqInternID, session:Session=Depends(get_db)):
    _attendance = attendance.checkInAttendance(session, intern_id=request.intern_id)
    _intern_id=request.intern_id
    return ResAttendance(code="201",
                         status="Created",
                         message=f"Intern ID: {_intern_id} checked in.",
                         result=_attendance).model_dump(exclude_none=True)

@router.post("/check-out")
async def checkOutAttendance(request:ReqInternID, session:Session=Depends(get_db)):
    _attendance = attendance.checkOutAttendance(session, intern_id=request.intern_id)
    _intern_id=request.intern_id
    return ResAttendance(code="201",
                         status="Created",
                         message=f"Intern ID: {_intern_id} checked out.",
                         result=_attendance).model_dump(exclude_none=True)

@router.post("/qr-scan")
async def registerAttendanceByQr(request:ReqInternID, session:Session=Depends(get_db)):
    _attendance = attendance.registerAttendanceByQr(session, intern_id=request.intern_id)
    return _attendance

@router.post("/scan")
async def scanQRAttendance():
    pass

@router.get("/timesheet")
async def getAll(session:Session=Depends(get_db)):
    _attendance = attendance.getAllAttendance(session, 0, 100)
    return ResAttendance(code="200",
                         status="Ok",
                         message=f"Attendance fetched successfully.",
                         result=_attendance
                         ).model_dump(exclude_none=True)

@router.patch("/timesheet/edit")
async def update(request:ReqUpdateAttendance, session:Session=Depends(get_db)):

    #get existing record
    existing_attendance = session.query(Attendance).filter(
        Attendance.intern_id == request.intern_id,
        Attendance.attendance_date == date.today()  
    ).first()
    
    if not existing_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found.")
    
    # keep existing value if not updating
    total_hours = existing_attendance.total_hours  
    
    #update total_hours if time_out is provided
    if request.time_out:
        if existing_attendance.time_in is None:
            raise HTTPException(status_code=400, detail="Time in is missing; cannot compute total hours.")

        time_out_datetime = datetime.combine(date.today(), request.time_out)
        total_hours = time_out_datetime - existing_attendance.time_in

        # update timeout in db
        existing_attendance.time_out = request.time_out

    _attendance = attendance.updateAttendance(session,
                                            intern_id=request.intern_id,
                                            remarks=request.remarks,
                                            total_hours=total_hours
                                            )
    return ResAttendance(code="200",
                         status="Updated",
                         message="Attendance updated successfully.",
                         result=_attendance
                         ).model_dump(exclude_none=True)

@router.delete("/timesheet/delete")
async def deleteById(request: ReqInternID, session: Session=Depends(get_db)):
    _attendance = attendance.removeAttendance(session, intern_id=request.intern_id)
    return ResAttendance(code="200",
                     status="Ok",
                     message="Intern Information removed successfully.",
                     result=_attendance
                     ).model_dump(exclude_none=True)

@router.get("/timesheet/by-date")
async def getByDate(target_date: date, session: Session = Depends(get_db)):
    _attendance = attendance.getAttendanceByDate(session, target_date)
    return ResAttendance(
        code="200",
        status="Ok",
        message=f"Attendance fetched successfully for {target_date}.",
        result=_attendance
    ).model_dump(exclude_none=True)



    

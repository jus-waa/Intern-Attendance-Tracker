from sqlalchemy import Column, String, Date, UUID, Interval, TIMESTAMP
from sqlalchemy.sql import func
from app.utils.db import Base

class InternHistory(Base):
    __tablename__ = "intern_history"

    intern_id = Column(UUID, primary_key=True)
    intern_name = Column(String(255), nullable=False)
    school_name = Column(String(255), nullable=False)
    internship_start_date = Column(Date, nullable=False)
    internship_end_date = Column(Date, nullable=False)
    shift_time = Column(String(50), nullable=False)
    coordinator_name = Column(String(255), nullable=False)
    total_required_hours = Column(Interval, nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<InternHistory({self.intern_name}, {self.school_name}, {self.status})>"


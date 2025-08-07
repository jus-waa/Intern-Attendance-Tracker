from sqlalchemy import Column, String, Date, UUID, Integer, Interval
from app.utils.db import Base

class InternHistory(Base):
    __tablename__ = "intern_history"

    intern_id = Column(UUID, primary_key=True)
    intern_name = Column(String(255))
    school_name = Column(String(255))
    abbreviation = Column(String(255))
    shift_name = Column(String(255))
    total_hours = Column(Interval)
    status = Column(String(255))

    def __repr__(self):
        return f"<InternHistory({self.intern_name}, {self.school_name}, {self.status})>"

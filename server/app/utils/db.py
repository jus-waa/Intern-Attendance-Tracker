#db config for connecting to the database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DB_URL = 'postgresql+psycopg2://postgres:Cvsu101Internship@localhost:5432/attendance_db'

#sets the connection to the db
engine = create_engine(DB_URL)
#acts as the interface talks to db lets you add, query, update, bind=engine connects session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#base class for ORM models(Object Relational Mapping lets you work with db using python classes and objects)
Base = declarative_base()

#dependency get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally: 
        db.close()

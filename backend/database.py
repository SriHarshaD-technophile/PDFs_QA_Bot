"""
database.py
-----------
Handles database connections and ORM setup for the project using SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database configuration 
DATABASE_URL = "sqlite:///./pdfs.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Function to connect to the database 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

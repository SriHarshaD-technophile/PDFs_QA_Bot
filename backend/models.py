"""
models.py
---------
Defines the SQLAlchemy models for the database tables used in the project.
Each model corresponds to a table structure for organizing and managing
database entries.
"""

from sqlalchemy import Column, String, DateTime
from datetime import datetime
from backend.database import Base

class PDFDocument(Base):
    __tablename__ = "pdf_documents"
    filename = Column(String, primary_key=True, index=True)
    upload_date = Column(DateTime, default=datetime.utcnow)
    content = Column(String) 
    file_url = Column(String) 

# Create the database tables if they don't exist
from .database import engine
Base.metadata.create_all(bind=engine)

"""
main.py
-------
The main entry point for the FastAPI backend application. This file initializes
the FastAPI app, sets up middleware, and includes the primary routes for
handling API requests.
"""

# Imports for FastAPI, database handling, and additional utilities
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request, Body, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import delete
from backend.database import get_db
from backend.models import PDFDocument
from backend.pdf_processing import extract_text_from_pdf, answer_question_with_rag
from datetime import datetime
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import boto3
import logging
import uuid
import hashlib


# Initialize the FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL - adjust as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define the request model for question-asking
class AskQuestionRequest(BaseModel):
    question: str
    filenames: List[str]
    session_id: str


# Dictionary to store session contexts for tracking questions/answers
session_contexts = {}

# AWS S3 configurations (example)
S3_BUCKET_NAME = "aip01"
AWS_ACCESS_KEY_ID = "AKIATJHQD6FD2FQWQD5W"
AWS_SECRET_ACCESS_KEY = "I+l6B6YpdoMykZDFfCq40Lw3BHQ7tItTj6KkLTx1"
AWS_REGION = "eu-north-1"


# Initialize the S3 client for file handling
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)


def generate_file_hash(content: str) -> str:
    """Generate a hash for the file content to check duplicates."""
    return hashlib.md5(content.encode('utf-8')).hexdigest()


@app.post("/upload_pdf/")
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a PDF file, process its text content, and save it to the database.
    Checks for duplicates and uploads to AWS S3 if unique.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File format not supported")

    # Extract text from PDF
    pdf_content = await file.read()
    pdf_text = extract_text_from_pdf(pdf_content)
    content_hash = generate_file_hash(pdf_text)

    # Retrieve any existing documents with the same filename
    existing_file = db.query(PDFDocument).filter(PDFDocument.filename == file.filename).first()

    if existing_file:
        # Check if the content matches (i.e., same hash) with any existing file
        existing_content_hash = generate_file_hash(existing_file.content)
        if existing_content_hash == content_hash:
            # Duplicate found, skip upload
            return {"message": "Duplicate file detected. The file already exists.", "filename": file.filename}

        # If filename exists but content is different, generate a new unique filename
        count = 1
        base_filename = file.filename.rsplit('.', 1)[0]
        extension = file.filename.rsplit('.', 1)[-1]
        new_filename = f"{base_filename}_{count}.{extension}"

        # Increment suffix until a unique filename is found
        while db.query(PDFDocument).filter(PDFDocument.filename == new_filename).first():
            count += 1
            new_filename = f"{base_filename}_{count}.{extension}"
    else:
        new_filename = file.filename

    # Upload to S3
    try:
        # Generate unique filename with timestamp for S3 storage
        timestamped_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{new_filename}"
        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET_NAME,
            timestamped_filename,
            ExtraArgs={
                "ContentType": "application/pdf",
                "ContentDisposition": "inline"
            }
        )

        # Create and save a new record in the database with the full text content
        pdf_doc = PDFDocument(filename=new_filename, content=pdf_text, upload_date=datetime.utcnow())
        db.add(pdf_doc)
        db.commit()
        db.refresh(pdf_doc)

        return {
            "filename": new_filename,
            "message": "PDF uploaded to S3 and processed successfully"
        }

    except Exception as e:
        logging.error(f"Error uploading PDF to S3 or saving in the database: {e}")
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"message": "An internal error occurred while uploading the PDF. Please try again later."}
        )


@app.get("/list_files/")
async def list_files(db: Session = Depends(get_db)):
    """
    Retrieve a list of all uploaded PDF files.
    """
    try:
        # Query the database to get all filenames
        files = db.query(PDFDocument.filename).all()
        
        if not files:
            return JSONResponse(
                status_code=404,
                content={"message": "No files found in the database."}
            )
        
        # Extract filenames from the query result
        file_list = [file.filename for file in files]
        
        return {"files": file_list}

    except Exception as e:
        logging.error(f"Error in /list_files/: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": "An internal error occurred while retrieving the file list. Please try again later."}
        )

@app.post("/start_session/")
async def start_session():
    """
    Starts a new session by generating a unique session ID.
    """
    session_id = str(uuid.uuid4())  # Generate a unique session ID
    session_contexts[session_id] = ""  # Initialize an empty context for this session
    return {"session_id": session_id}

@app.post("/ask_question/")
async def ask_question(
    request: AskQuestionRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Ask a question within a specific session, using provided filenames.
    """
    session_id = request.session_id

    # Check if the session ID exists
    if session_id not in session_contexts:
        raise HTTPException(status_code=404, detail="Session ID not found. Please start a new session.")

    # Combine the content of selected documents
    combined_content = ""
    for filename in request.filenames:
        pdf_doc = db.query(PDFDocument).filter(PDFDocument.filename == filename).first()
        if pdf_doc:
            combined_content += f"\nDocument: {filename}\n{pdf_doc.content}"  # Limit content if necessary
        else:
            logging.warning(f"File '{filename}' not found in the database.")

    if not combined_content:
        raise HTTPException(status_code=404, detail="No valid documents found for the given filenames.")

    # Append the new question to the session context for tracking history
    session_contexts[session_id] += f"User question: {request.question}\n"

    # Construct full context with session history and combined document content
    full_context = f"{session_contexts[session_id]} Document content: {combined_content}"
    
    # Get the answer using RAG with the full context
    answer = answer_question_with_rag(full_context, request.question)

    # Append the answer to session context for ongoing memory
    session_contexts[session_id] += f"Assistant answer: {answer}\n"

    return {"question": request.question, "answer": answer}

@app.get("/get_history/")
async def get_history(session_id: str):
    """
    Retrieve the question-answer history for a specific session.
    """
    # Check if the session ID exists
    if session_id not in session_contexts:
        raise HTTPException(status_code=404, detail="Session ID not found.")

    # Return the history for the specific session
    return {"session_id": session_id, "history": session_contexts[session_id]}

@app.delete("/clear_session/")
async def clear_session(session_id: str):
    """
    Clears the specific session by deleting its history.
    """
    # Check if the session ID exists
    if session_id not in session_contexts:
        raise HTTPException(status_code=404, detail="Session ID not found.")

    # Clear the session's context
    del session_contexts[session_id]
    return {"message": f"Session {session_id} has been cleared."}

"""
pdf_processing.py
-----------------
Contains functions and utilities for handling PDF processing tasks, such as
text extraction, parsing, and other content manipulations specific to PDF files.
"""

import io
import fitz  # PyMuPDF for PDF text extraction
import pytesseract  # PyMuPDF for Image-Based PDF text extraction
import logging
from PIL import Image
from langchain_openai import ChatOpenAI, OpenAIEmbeddings  
from langchain.chains import LLMChain
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.vectorstores.base import VectorStoreRetriever
from langchain.schema import SystemMessage, HumanMessage

# Initialize LLM with OpenAI API key (example)
llm = ChatOpenAI(model="gpt-3.5-turbo", openai_api_key="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")

def extract_text_from_pdf(file) -> str:
    """Extracts text from the PDF file, including OCR for image-based pages."""
    pdf_text = ""
    
    # Open the PDF file from the byte stream
    with fitz.open(stream=file, filetype="pdf") as pdf:
        for page in pdf:
            # Try to get text content directly
            text = page.get_text()
            
            if not text.strip():  # If no text, assume it's image-based and use OCR
                # Convert the page to an image
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                
                # Use OCR to extract text from the image
                text = pytesseract.image_to_string(img)
                
            pdf_text += text + "\n"
    
    return pdf_text

def create_vector_store(pdf_text: str):
    """Creates a vector store for the PDF content using FAISS."""
    # Split the text into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_text(pdf_text)

    # Initialize embeddings and vector store with OpenAI API key
    embeddings = OpenAIEmbeddings(openai_api_key="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")
    vector_store = FAISS.from_texts(chunks, embedding=embeddings)
    return vector_store

def answer_question_with_rag(context: str, question: str) -> str:
    """Uses RAG to answer questions based on document content and session context."""
    try:
        # Construct messages with context and explicit instruction for follow-up awareness
        messages = [
            SystemMessage(content="You are a helpful assistant specialized in document analysis and Q&A."),
            HumanMessage(content=f"The following is the context based on previous questions and answers, along with document content:\n\n{context}\n\nNow answer the question: {question}")
        ]

        # Generate the response
        answer = llm.invoke(messages)
        logging.info(f"Generated answer: {answer.content}")
        return answer.content

    except Exception as e:
        logging.error(f"Error in RAG question answering: {e}")
        return "An error occurred while generating the answer."
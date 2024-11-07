
# PDFs_QA_Bot - Full Stack PDFs QA Application

## Overview
PDFs_QA_Bot is a full-stack application enabling users to upload PDF documents, ask questions about their content, and receive AI-powered responses. Designed to provide a seamless experience, this app integrates a **FastAPI backend** with **React.js** for the frontend. The application processes PDF files, extracts text, and answers user questions with natural language processing (NLP) capabilities, utilizing both **LangChain** and the **OpenAI API** for advanced question answering.

## Features

### Key Functionality
- **PDF Upload**: Upload PDF files, which are stored securely and processed for text extraction.
- **Ask Questions**: Users can pose questions related to the content of uploaded PDFs.
- **Answer Display**: Provides answers based on PDF content with support for follow-up queries.
- **Session Management and Continuity**: Each interaction is session-based, allowing for contextually aware answers. Maintains Q&A continuity within a session, even across page reloads.

### Additional Features
- **Smooth Interactions**: The chat interface allows users to send messages with the “Enter” key, providing a natural chat experience similar to popular messaging apps.
- **Responsive Design**: The layout adjusts across mobile and desktop devices for enhanced accessibility and usability.
- **Error Handling and Feedback**: Real-time error messages guide users if they attempt actions like asking questions without selecting PDFs or starting a session.
- **Modern Visuals**: Styled with clean, modern elements using **Material-UI** and **Styled Components** to ensure a visually appealing design.
- **Background Customization**: Users can personalize their chat background, creating a more engaging environment.

## Technology Stack

### Backend
- **FastAPI**: For building the backend API and handling requests.
- **LangChain**: Core NLP framework for managing and orchestrating complex language tasks.
- **OpenAI API**: Provides NLP processing for Q&A, integrated with LangChain.
- **SQLAlchemy**: ORM used to manage SQLite database connections.
- **PyMuPDF**: Library for PDF text extraction.
- **AWS SDK (boto3)**: For managing PDF storage in AWS S3.
- **Python Libraries**: `uuid`, `hashlib`, `logging`, `datetime`, and `pydantic` for session handling, file processing, and type validation.

### Frontend
- **React.js**: Core library for building the interactive UI.
- **Styled Components**: For managing CSS styling in JavaScript.
- **Material-UI (MUI)**: Provides accessible and responsive UI components.
- **React Icons**: For iconography within the app (e.g., upload, chat control icons).
- **Axios**: HTTP client for making API requests to the backend.

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/project11.git
```

### 2. Backend Setup

#### Activate the Virtual Environment
```bash
source venv/bin/activate  
```

#### Install the required Python Dependencies

#### Add AWS credentials, OpenAI API key, and database configurations
Create a `.env` file in the `backend` directory and add the following:
```env
DATABASE_URL=sqlite:///./pdfs.db
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your_s3_bucket_name
OPENAI_API_KEY=your_openai_api_key
```
> **Note**: Ensure your OpenAI API key is active for the backend server to process questions effectively.

#### Run Backend Server
```bash
uvicorn backend.main:app --reload
```

### 3. Frontend Setup

#### Install Node Modules
```bash
cd frontend
npm install
```

#### Start Frontend Server
```bash
npm start
```

### 4. Initialize Database
Create the required database tables by running:
```bash
python -m backend.database
```

## Usage

### Upload PDF
Click on "Select PDF Files" to upload your PDFs.

### Start a Session
Start a new session before asking questions.

### Select PDF Files
After starting a session, choose specific PDFs for querying. This is essential as questions are answered based only on the content of the selected PDFs. Multiple PDFs can be selected for broader context.

### Ask Questions
Type questions in the chat interface, and receive AI-generated responses based on the selected PDF content. Quickly submit messages by pressing enter on keyboard or by pressing send button on the interface, similar to a typical chat application.

### Error Handling
If you attempt to ask a question without starting a session or selecting PDF files, the application will display an error message guiding you to complete the necessary steps.

## Session Management and Continuity
PDFs_QA_Bot includes robust session management to ensure smooth and consistent user interactions:

- **Session Persistence Across Reloads**: Even if the page is reloaded, PDFs_QA_Bot will automatically reload the session and message history from local storage. This ensures that users can continue their conversations seamlessly without losing context or answers.
- **Context-Aware Responses**: For each session, the chat context is maintained. Users can select different PDF files for each question, and PDFs_QA_Bot will respond based on the chat’s context and the specific content in the chosen PDF file(s).
- **Session Clearance**: The session data (including all questions and answers) will persist until the user explicitly clears it. Once cleared, the system resets for a fresh Q&A experience.

### Background Customization
To change the background of the chat interface:

1. Click the "Wallpaper" icon in the chat toolbar.
2. Select "Upload Background" and choose an image file from your device.
3. The chosen image will apply as the chat background with a subtle opacity to enhance readability.
4. To reset the background, select "Clear Background" from the menu.

### Image-Based PDF Processing
For image-based text PDFs (such as scanned documents), OCR processing is supported.

## Flowchart

```plaintext
+---------------------+
|  User Interface     |
+---------------------+
        |
        v
+---------------------+
|  Upload PDF         |
+---------------------+
        |
        v
+---------------------+            +---------------------+
|  FastAPI Endpoint   |<---------- |  LangChain &       |
|  (Extract PDF Text) |           |  OpenAI API        |
+---------------------+            |  (NLP Processing)  |
                                   +---------------------+
        |
        v
+---------------------+
|  Store in Database  |
+---------------------+
        |
        v
+---------------------+
|  Answer Questions   |
+---------------------+
        |
        v
+---------------------+
|  Display Answers    |
+---------------------+
```


## API Documentation

| Endpoint           | Method | Description                                      |
|--------------------|--------|--------------------------------------------------|
| `/upload_pdf/`     | POST   | Uploads a PDF and extracts text for storage.     |
| `/list_files/`     | GET    | Returns a list of uploaded files.                |
| `/start_session/`  | POST   | Initiates a new Q&A session.                     |
| `/ask_question/`   | POST   | Accepts a question and returns an answer based on PDF content. |
| `/clear_session/`  | DELETE | Ends a session and clears related data.          |


## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any bugs or feature requests.

---

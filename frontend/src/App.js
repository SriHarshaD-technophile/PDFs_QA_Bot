/**
 * App.js
 * ------
 * Main React component that serves as the root of the application.
 * Manages global states such as session handling, messages, file list, and background settings.
 * Incorporates Header and Chat components.
 */

import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import Header from './components/Header';
import Chat from './components/Chat';

// Global styles for the entire application
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f6f9;
  }

  @media (max-width: 768px) {
    body {
      font-size: 14px; /* Reduce font size for mobile */
    }
}
    
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;

  @media (max-width: 768px) {
    padding: 10px; /* Add padding for a more compact look on mobile */
  }
`;

function App() {
  // Define application states
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(() => localStorage.getItem("chatBackground") || null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Restore sessionId and messages from localStorage when the app loads
  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    const storedMessages = JSON.parse(localStorage.getItem("messages") || "[]");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      setIsSessionActive(true);
      setMessages(storedMessages); // Restore messages
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  // Fetch list of files from the backend
  const fetchFileList = async () => {
    try {
      const response = await axios.get('http://localhost:8000/list_files/');
      setFileList(response.data.files);
    } catch (error) {
      console.error('Error fetching file list:', error);
      alert('Failed to fetch file list.');
    }
  };

  // Toggle selected files
  const handleSelectPDF = (file) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(file) ? prevSelected.filter((f) => f !== file) : [...prevSelected, file]
    );
  };

  // Upload a PDF file to the backend
  const handleUploadPDF = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await axios.post('http://localhost:8000/upload_pdf/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          alert(response.data.message);
          fetchFileList();
        } catch (error) {
          console.error('Error uploading PDF:', error);
          alert('Failed to upload PDF.');
        }
      }
    };
    input.click();
  };

  // Start a new chat session
  const handleStartSession = async () => {
    try {
      const response = await axios.post('http://localhost:8000/start_session/');
      const newSessionId = response.data.session_id;
      setSessionId(newSessionId);
      setIsSessionActive(true);
      setMessages([]); // Start with a fresh message history
      localStorage.setItem("sessionId", newSessionId);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start a new session.');
    }
  };

  // Clear the current session
  const handleClearSession = async () => {
    if (!sessionId) {
      alert('No active session to clear.');
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/clear_session/?session_id=${sessionId}`);
      setSessionId(null);
      setMessages([]);
      setSelectedFiles([]);
      setIsSessionActive(false);
      localStorage.removeItem("sessionId");
      localStorage.removeItem("messages"); // Clear messages from localStorage
      alert('Session cleared successfully.');
    } catch (error) {
      console.error('Error clearing session:', error);
      alert('Failed to clear the session.');
    }
  };

  // Change the background image for the chat
  const handleChangeBackground = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setBackgroundImage(reader.result);
          localStorage.setItem("chatBackground", reader.result); // Save background to localStorage
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Send a question to the backend and handle the response
  const handleSendQuestion = async (question) => {
    if (!sessionId) {
      alert('Please start a session first.');
      return;
    }

    const newMessage = { sender: 'user', text: question };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      const response = await axios.post('http://localhost:8000/ask_question/', {
        question,
        filenames: selectedFiles,
        session_id: sessionId
      });

      const answer = response.data.answer;
      const assistantMessage = { sender: 'assistant', text: answer };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending question:', error);
      const errorMessage = { sender: 'assistant', text: 'An error occurred while generating the answer.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  // Fetch file list on initial load
  useEffect(() => {
    fetchFileList();
  }, []);

  // Persist background image to localStorage when changed
  useEffect(() => {
    if (backgroundImage) {
      localStorage.setItem("chatBackground", backgroundImage);
    }
  }, [backgroundImage]);

  return (
    <AppContainer>
      <GlobalStyle />
      <Header onUpload={handleUploadPDF} onSelectPDF={handleSelectPDF} fileList={fileList} />
      <Chat
        messages={messages}
        onSend={handleSendQuestion}
        onStartSession={handleStartSession}
        onClearSession={handleClearSession}
        onChangeBackground={handleChangeBackground}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        selectedFiles={selectedFiles}
        onSelectPDF={handleSelectPDF}
        isSessionActive={isSessionActive}
      />
    </AppContainer>
  );
}

export default App;

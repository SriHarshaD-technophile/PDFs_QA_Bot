/**
 * Chat.js
 * -------
 * React component for rendering the chat interface in the frontend application.
 * This component provides messaging functionality, session management, 
 * and customizable backgrounds for an engaging user experience.
 */


// Import necessary React and Material-UI components
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TextField, IconButton, Menu, MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import WallpaperIcon from '@mui/icons-material/Wallpaper';

// Styled components for organizing layout
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  padding: 20px;
  position: relative;

  @media (max-width: 768px) {
    padding: 10px; /* Reduce padding on mobile */
  }
`;

const BackgroundLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${({ background }) => (background ? `url(${background})` : 'none')};
  background-size: cover;
  background-position: center;
  filter: blur(3px);
  opacity: 0.3;
  z-index: 1;

  @media (max-width: 768px) {
    filter: blur(2px); /* Lighter blur on mobile */
    opacity: 0.2; /* Reduced opacity for a more subtle effect */
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 8px; /* Smaller padding for mobile */
    gap: 8px;
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 18px;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ sender }) => (sender === 'user' ? '#ffffff' : '#333')};
  background-color: ${({ sender }) => (sender === 'user' ? '#28a745' : '#e0e0e0')};
  border-radius: 20px;
  align-self: ${({ sender }) => (sender === 'user' ? 'flex-end' : 'flex-start')};
  white-space: pre-wrap;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;

  @media (max-width: 768px) {
    max-width: 90%; /* Allow more width for mobile */
    font-size: 14px; /* Adjust font size for readability */
    padding: 10px 15px;
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  position: sticky;
  bottom: 0;
  z-index: 3;
  margin-top: 10px;

  @media (max-width: 768px) {
    flex-direction: row; /* Stack controls on mobile */
    padding: 4px;
    justify-content: space-between;
  }
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-right: 10px;

  @media (max-width: 768px) {
    flex-direction: row; /* Stack buttons vertically on mobile */
    gap: 4px;
    margin-right: 0;
  }
`;


const Chat = ({ messages = [], onSend, onStartSession, onClearSession, backgroundImage, setBackgroundImage, selectedFiles }) => {
  const [input, setInput] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(() => {
    // Load isSessionActive from localStorage on component mount
    return localStorage.getItem("isSessionActive") === "true";
  });
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Track session state across page loads
  useEffect(() => {
    localStorage.setItem("isSessionActive", isSessionActive);
  }, [isSessionActive]);

  // Handler for sending a message
  const handleSend = () => {
    if (!isSessionActive) {
      alert("Please start session first.");
      return;
    }

    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select PDF(s) first.");
      return;
    }

    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };
 
  // Handlers for session start/stop
  const handleStart = () => {
    onStartSession();
    setIsSessionActive(true);
  };


  // Handlers for background image selection
  const handleStop = () => {
    onClearSession();
    setIsSessionActive(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBackgroundChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const background = reader.result;
          setBackgroundImage(background);
          localStorage.setItem("chatBackground", background);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    handleMenuClose();
  };

  const clearBackground = () => {
    setBackgroundImage(null);
    localStorage.removeItem("chatBackground");
    handleMenuClose();
  };

  return (
    <ChatContainer>
      {backgroundImage && <BackgroundLayer background={backgroundImage} />}

      <MessagesContainer>
        {messages && messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender}>
            {msg.text}
          </MessageBubble>
        ))}
      </MessagesContainer>

      <InputContainer>
        <ControlButtons>
          <IconButton color={isSessionActive ? "primary" : "default"} onClick={handleStart} disabled={isSessionActive}>
            <PlayArrowIcon />
          </IconButton>
          <IconButton color={!isSessionActive ? "secondary" : "default"} onClick={handleStop} disabled={!isSessionActive}>
            <StopIcon />
          </IconButton>

          <IconButton color="primary" onClick={handleMenuOpen}>
            <WallpaperIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleBackgroundChange}>Upload Background</MenuItem>
            <MenuItem onClick={clearBackground}>Clear Background</MenuItem>
          </Menu>
        </ControlButtons>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />

        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;
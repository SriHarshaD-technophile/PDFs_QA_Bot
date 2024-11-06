/**
 * Header.js
 * ---------
 * React component for rendering the header section of the application.
 * Provides controls for selecting and uploading PDF files, along with a logo display.
 */


// Import necessary React hooks, styled components, and icons
import React, { useState } from 'react';
import styled from 'styled-components';
import { Menu, MenuItem } from '@mui/material';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { BsFillFileEarmarkArrowUpFill } from 'react-icons/bs';
import logo from '../assets/logo1.png';


// Styled component for header container layout
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 5px 10px; /* Reduced padding for mobile */
  }
`;

// Styled component for logo image
const Logo = styled.img`
  height: 75px;

  @media (max-width: 768px) {
    height: 45px; /* Smaller logo on mobile */
  }
`;

// Container for action buttons in the header
const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

// Button styling with conditional hover effects
const IconOnlyButton = styled.button`
  color: #28a745;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(40, 167, 69, 0.1);
  }

  span {
    display: inline; /* Text is shown by default */

    @media (max-width: 768px) {
      display: none; /* Hide text on mobile */
    }
  }
`;


const Header = ({ onUpload, onSelectPDF, fileList }) => {
  // State for managing dropdown menu and file selection
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Open file selection dropdown menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close file selection dropdown menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Toggle file selection status when clicked in the menu
  const handleFileToggle = (file) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(file)
        ? prevSelected.filter((f) => f !== file)
        : [...prevSelected, file]
    );

    onSelectPDF(file);
  };

  return (
    <HeaderContainer>
      <Logo src={logo} alt="AI Planet Logo" />
      <ButtonContainer>
        <IconOnlyButton onClick={handleMenuOpen}>
          <AiOutlinePlusCircle size={24} />
          <span>Select PDF Files</span>
        </IconOnlyButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {fileList.map((file, index) => (
            <MenuItem
              key={index}
              selected={selectedFiles.includes(file)}
              onClick={() => handleFileToggle(file)}
            >
              {selectedFiles.includes(file) ? "✅ " : ""} {file}
            </MenuItem>
          ))}
        </Menu>

        <IconOnlyButton onClick={onUpload}>
          <BsFillFileEarmarkArrowUpFill size={24} />
          <span>Upload PDF</span>
        </IconOnlyButton>
      </ButtonContainer>
    </HeaderContainer>
  );
};

export default Header;


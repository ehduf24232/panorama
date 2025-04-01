import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.a`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1000;
  text-decoration: none;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
    color: white;
  }

  &:active {
    transform: translateY(0);
  }
`;

const ConsultButton: React.FC = () => {
  return (
    <StyledButton 
      href="http://localhost:3001"
      target="_blank"
      rel="noopener noreferrer"
    >
      상담신청
    </StyledButton>
  );
};

export default ConsultButton; 
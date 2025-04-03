import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const ButtonContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
`;

const StyledButton = styled.button`
  height: 38px;
  line-height: 38px;
  padding: 0 20px;
  font-size: 1rem;
  background-color: rgba(153, 51, 255, 0.3);
  color: white;
  border: 1px solid rgba(153, 51, 255, 0.5);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
  backdrop-filter: blur(10px);

  & > svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 0;
    width: 38px;
    border-radius: 50%;

    span {
      display: none;
    }

    & > svg {
      margin: 0;
    }
  }

  &:hover {
    background-color: rgba(153, 51, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(153, 51, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const HomeButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ButtonContainer>
      <StyledButton onClick={() => navigate('/')}>
        <HomeIcon />
        <span>홈으로</span>
      </StyledButton>
    </ButtonContainer>
  );
};

export default HomeButton; 
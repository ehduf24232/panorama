import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link as LinkIcon } from '@mui/icons-material';
import api from '../api';

const StyledButton = styled.a`
  position: fixed;
  top: 20px;
  right: 160px;
  height: 38px;
  line-height: 38px;
  padding: 0 20px;
  font-size: 1rem;
  background-color: white;
  color: rgba(153, 51, 255, 1);
  border: 1px solid rgba(153, 51, 255, 0.5);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.4s;
  text-decoration: none;
  z-index: 1000;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  font-weight: 700;

  & > svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &:hover {
    background-color: rgba(153, 51, 255, 0.3);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(153, 51, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface Settings {
  customLinkUrl: string;
  customLinkText: string;
}

const CustomLinkButton: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    customLinkUrl: 'https://www.naver.com',
    customLinkText: '네이버'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/settings');
        const data = response.data;
        if (data.customLinkUrl && data.customLinkText) {
          setSettings(data);
        }
      } catch (error) {
        console.error('설정을 가져오는데 실패했습니다:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <StyledButton
      href={settings.customLinkUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <LinkIcon />
      {settings.customLinkText}
    </StyledButton>
  );
};

export default CustomLinkButton; 
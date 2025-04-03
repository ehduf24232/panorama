import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Chat as ChatIcon } from '@mui/icons-material';
import axios from 'axios';
import CustomLinkButton from '../components/CustomLinkButton';
import { Link } from 'react-router-dom';
import HomeButton from '../components/HomeButton';
<<<<<<< HEAD
=======
import api from '../api';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://panorama-backend.onrender.com'
  : 'http://localhost:5000';
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: #000000;
    color: #ffffff;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #000000 0%, #1a0033 100%);
  position: relative;
  overflow: hidden;

<<<<<<< HEAD
=======
  @media (max-width: 768px) {
    padding: 4rem 1rem 2rem 1rem;
  }

>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(153, 51, 255, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%);
    z-index: 0;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg at 50% 50%, rgba(153, 51, 255, 0.2) 0%, transparent 60%);
    animation: rotate 60s linear infinite;
    z-index: 0;
    pointer-events: none;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 2rem;
  color: #fff;
  font-weight: 700;
  text-align: center;
  position: relative;
  z-index: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const ConsultButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  height: 38px;
  line-height: 38px;
  padding: 0 20px;
  font-size: 1rem;
  background-color: rgba(153, 51, 255, 0.3);
  color: white;
  border: 1px solid rgba(153, 51, 255, 0.5);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.4s;
  z-index: 1000;
  backdrop-filter: blur(10px);

  & > svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
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

const NeighborhoodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  z-index: 1;
`;

const NeighborhoodCard = styled(Link)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 48px rgba(153, 51, 255, 0.3);
    border-color: rgba(153, 51, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const NeighborhoodImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: rgba(0, 0, 0, 0.3);
`;

const NeighborhoodInfo = styled.div`
  padding: 1.5rem;
`;

const NeighborhoodName = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #fff;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const NeighborhoodDescription = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

interface Neighborhood {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const NeighborhoodList = () => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
<<<<<<< HEAD
        const response = await axios.get('http://localhost:5000/api/neighborhoods');
=======
        const response = await api.get('/api/neighborhoods');
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
        setNeighborhoods(response.data);
      } catch (error) {
        console.error('동네 목록을 불러오는데 실패했습니다:', error);
      }
    };

    fetchNeighborhoods();
  }, []);

  const handleConsultClick = () => {
    window.location.href = '/consultation';
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <HomeButton />
        <Title>동네를 선택해주세요</Title>
        <ConsultButton onClick={handleConsultClick}>
          <ChatIcon />
          상담신청
        </ConsultButton>
        <CustomLinkButton />
        <NeighborhoodGrid>
          {neighborhoods.map((neighborhood) => (
            <NeighborhoodCard key={neighborhood._id} to={`/neighborhoods/${neighborhood._id}/buildings`}>
              <NeighborhoodImage 
<<<<<<< HEAD
                src={`http://localhost:5000${neighborhood.imageUrl}`} 
=======
                src={`${API_BASE_URL}${neighborhood.imageUrl}`} 
>>>>>>> 0282ec32634cd33da6e775ee53973250ec8b757b
                alt={neighborhood.name}
                onError={(e) => {
                  console.error('이미지 로드 실패:', neighborhood.name);
                  (e.target as HTMLImageElement).src = '/placeholder.png';
                }}
              />
              <NeighborhoodInfo>
                <NeighborhoodName>{neighborhood.name}</NeighborhoodName>
                <NeighborhoodDescription>{neighborhood.description}</NeighborhoodDescription>
              </NeighborhoodInfo>
            </NeighborhoodCard>
          ))}
        </NeighborhoodGrid>
      </Container>
    </>
  );
};

export default NeighborhoodList; 
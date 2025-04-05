import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Chat as ChatIcon } from '@mui/icons-material';
import HomeButton from '../components/HomeButton';
import CustomLinkButton from '../components/CustomLinkButton';
import { useData } from '../contexts/DataContext';

// API_BASE_URL 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://panorama-backend.onrender.com';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: #000000;
    color: #ffffff;
  }
`;

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a0033 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 4rem 1rem 2rem 1rem;
  }

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

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
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

const BuildingGrid = styled.div`
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

const BuildingCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 48px rgba(153, 51, 255, 0.3);
    border-color: rgba(153, 51, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const BuildingImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: rgba(0, 0, 0, 0.3);
`;

const BuildingInfo = styled.div`
  padding: 1.5rem;
`;

const BuildingName = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #fff;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const BuildingDescription = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.5;
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

interface Building {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const BuildingsPage = () => {
  const { neighborhoodId } = useParams();
  const navigate = useNavigate();
  const { buildings, fetchBuildingsByNeighborhood } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBuildings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!neighborhoodId) {
          throw new Error('동네 ID가 없습니다.');
        }

        console.log('건물 목록 로딩 시작:', neighborhoodId);
        await fetchBuildingsByNeighborhood(neighborhoodId);
        console.log('건물 목록 로딩 완료:', buildings);
      } catch (error) {
        console.error('건물 목록을 불러오는데 실패했습니다:', error);
        setError(error instanceof Error ? error.message : '건물 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadBuildings();
  }, [neighborhoodId, fetchBuildingsByNeighborhood]);

  const handleConsultClick = () => {
    window.location.href = '/consultation';
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <HomeButton />
        <CustomLinkButton />
        <ConsultButton onClick={handleConsultClick}>
          <ChatIcon />
          상담신청
        </ConsultButton>
        <ContentWrapper>
          <Title>건물을 선택해주세요</Title>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'white', marginTop: '2rem' }}>로딩 중...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'white', marginTop: '2rem' }}>{error}</div>
          ) : buildings.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'white', marginTop: '2rem' }}>등록된 건물이 없습니다.</div>
          ) : (
            <BuildingGrid>
              {buildings.map((building) => (
                <BuildingCard
                  key={building._id}
                  onClick={() => navigate(`/neighborhoods/${neighborhoodId}/buildings/${building._id}/rooms`)}
                >
                  <BuildingImage
                    src={`${API_BASE_URL}${building.imageUrl}`}
                    alt={building.name}
                    onError={(e) => {
                      console.error('이미지 로드 실패:', building.name);
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                  <BuildingInfo>
                    <BuildingName>{building.name}</BuildingName>
                    <BuildingDescription>{building.description}</BuildingDescription>
                  </BuildingInfo>
                </BuildingCard>
              ))}
            </BuildingGrid>
          )}
        </ContentWrapper>
      </Container>
    </>
  );
};

export default BuildingsPage; 
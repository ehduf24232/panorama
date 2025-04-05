import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useData } from '../contexts/DataContext';
import ConsultButton from '../components/ConsultButton';
import HomeButton from '../components/HomeButton';
import CustomLinkButton from '../components/CustomLinkButton';

// API_BASE_URL 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://panorama-backend.onrender.com';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: #000000;
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
  text-align: center;
  margin-bottom: 2rem;
  color: #fff;
  font-size: 3.5rem;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
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

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: rgba(0, 0, 0, 0.3);
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-top: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const NeighborhoodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { neighborhoods, fetchNeighborhoods } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNeighborhoods = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchNeighborhoods();
      } catch (error) {
        console.error('동네 목록을 불러오는데 실패했습니다:', error);
        setError('동네 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadNeighborhoods();
  }, [fetchNeighborhoods]);

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) {
      console.log('[이미지 URL] 이미지 URL이 없음, 기본 이미지 사용');
      return '/placeholder.png';
    }

    const fullUrl = `${API_BASE_URL}${imageUrl}`;
    console.log('[이미지 URL] 생성된 전체 URL:', fullUrl);
    return fullUrl;
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <HomeButton />
        <ConsultButton />
        <CustomLinkButton />
        <ContentWrapper>
          <Title>동네를 선택해주세요</Title>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'white', marginTop: '2rem' }}>로딩 중...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'white', marginTop: '2rem' }}>{error}</div>
          ) : neighborhoods.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'white', marginTop: '2rem' }}>등록된 동네가 없습니다.</div>
          ) : (
            <CardGrid>
              {neighborhoods.map((neighborhood) => (
                <Card 
                  key={neighborhood._id} 
                  onClick={() => navigate(`/neighborhoods/${neighborhood._id}/buildings`)}
                >
                  <CardImage
                    src={getImageUrl(neighborhood.imageUrl)}
                    alt={neighborhood.name}
                    onError={(e) => {
                      console.error('[이미지 로드 실패]', {
                        동네: neighborhood.name,
                        URL: neighborhood.imageUrl
                      });
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                  <CardContent>
                    <CardTitle>{neighborhood.name}</CardTitle>
                    <CardDescription>{neighborhood.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </CardGrid>
          )}
        </ContentWrapper>
      </Container>
    </>
  );
};

export default NeighborhoodsPage; 
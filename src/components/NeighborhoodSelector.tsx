import React from 'react';
import styled from 'styled-components';
import { Neighborhood } from '../contexts/DataContext';
import ConsultButton from '../components/ConsultButton';

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const CardDescription = styled.p`
  color: #666;
  margin-top: 1rem;
`;

interface NeighborhoodSelectorProps {
  neighborhoods: Neighborhood[];
  onSelect: (neighborhood: Neighborhood) => void;
}

const NeighborhoodSelector: React.FC<NeighborhoodSelectorProps> = ({
  neighborhoods,
  onSelect,
}) => {
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) {
      return '/placeholder.png';
    }

    const baseUrl = 'http://localhost:5000';
    return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  };

  return (
    <Container>
      <ConsultButton />
      <Title>동네를 선택해주세요</Title>
      <CardGrid>
        {neighborhoods.map((neighborhood) => (
          <Card
            key={neighborhood._id}
            onClick={() => onSelect(neighborhood)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(neighborhood);
              }
            }}
          >
            <CardImage
              src={getImageUrl(neighborhood.imageUrl)}
              alt={neighborhood.name}
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('이미지 로드 실패:', {
                  동네: neighborhood.name,
                  URL: neighborhood.imageUrl
                });
                e.currentTarget.src = '/placeholder.png';
              }}
            />
            <CardContent>
              <CardTitle>{neighborhood.name}</CardTitle>
              <CardDescription>{neighborhood.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </CardGrid>
    </Container>
  );
};

export default NeighborhoodSelector; 
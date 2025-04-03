import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const Header = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-bottom: 20px;
  padding: 0 20px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #3498db;
  font-size: 1rem;
  cursor: pointer;
  padding: 10px 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #2980b9;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
  }
`;

const BuildingCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const BuildingImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    height: 180px;
  }
`;

const BuildingName = styled.h3`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const BuildingInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const BuildingDescription = styled.p`
  color: #7f8c8d;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

interface Building {
  id: string;
  name: string;
  description: string;
  image: string;
  yearBuilt: number;
  floors: number;
}

interface BuildingSelectorProps {
  buildings: Building[];
  neighborhoodName: string;
  onSelect: (building: Building) => void;
  onBack: () => void;
}

const BuildingSelector: React.FC<BuildingSelectorProps> = ({
  buildings,
  neighborhoodName,
  onSelect,
  onBack,
}) => {
  return (
    <Container role="main">
      <Header>
        <BackButton
          onClick={onBack}
          title="뒤로 가기"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onBack();
            }
          }}
        >
          ← 뒤로 가기
        </BackButton>
        <Title>{neighborhoodName}의 빌딩</Title>
      </Header>
      <ContentWrapper>
        <Grid role="list">
          {buildings.map((building) => (
            <BuildingCard
              key={building.id}
              onClick={() => onSelect(building)}
              role="button"
              title={building.name}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(building);
                }
              }}
            >
              <BuildingImage
                src={building.image}
                alt={building.name}
                title={building.name}
                loading="lazy"
              />
              <BuildingName>
                {building.name}
              </BuildingName>
              <BuildingInfo>
                <span>
                  준공년도: {building.yearBuilt}년
                </span>
                <span>
                  {building.floors}층
                </span>
              </BuildingInfo>
              <BuildingDescription>
                {building.description}
              </BuildingDescription>
            </BuildingCard>
          ))}
        </Grid>
      </ContentWrapper>
    </Container>
  );
};

export default BuildingSelector; 
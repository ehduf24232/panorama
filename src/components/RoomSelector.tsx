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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  margin-bottom: 40px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
    margin-bottom: 20px;
  }
`;

const RoomCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: fit-content;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const RoomImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    height: 180px;
  }
`;

const RoomName = styled.h3`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const RoomInfo = styled.div`
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

const RoomDescription = styled.p`
  color: #7f8c8d;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

interface Room {
  id: string;
  name: string;
  description: string;
  image: string;
  size: number;
  price: number;
  floor: number;
  panoramaUrl: string;
}

interface RoomSelectorProps {
  rooms: Room[];
  buildingName: string;
  onSelect: (room: Room) => void;
  onBack: () => void;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
  rooms,
  buildingName,
  onSelect,
  onBack,
}) => {
  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>
          ← 뒤로 가기
        </BackButton>
        <Title>{buildingName}의 호실</Title>
      </Header>
      <ContentWrapper>
        <Grid>
          {rooms.map((room) => (
            <RoomCard key={room.id} onClick={() => onSelect(room)}>
              <RoomImage src={room.image} alt={room.name} />
              <RoomName>{room.name}</RoomName>
              <RoomInfo>
                <span>면적: {room.size}㎡</span>
                <span>월세: {room.price.toLocaleString()}원</span>
                <span>{room.floor}층</span>
              </RoomInfo>
              <RoomDescription>{room.description}</RoomDescription>
            </RoomCard>
          ))}
        </Grid>
      </ContentWrapper>
    </Container>
  );
};

export default RoomSelector; 
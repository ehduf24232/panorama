import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Chat as ChatIcon } from '@mui/icons-material';
import CustomLinkButton from '../components/CustomLinkButton';
import api from '../api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
`;

const ConsultButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  height: 38px;
  line-height: 38px;
  padding: 0 20px;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  z-index: 1000;
  box-sizing: border-box;

  & > svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BuildingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const BuildingCard = styled(Link)`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
  }
`;

const BuildingImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const BuildingInfo = styled.div`
  padding: 20px;
`;

const BuildingName = styled.h2`
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: #333;
`;

const BuildingDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
`;

interface Building {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  floors: number;
}

const BuildingList = () => {
  const { neighborhoodId } = useParams<{ neighborhoodId: string }>();
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await api.get(`/api/buildings/neighborhood/${neighborhoodId}`);
        setBuildings(response.data);
      } catch (error) {
        console.error('건물 목록을 불러오는데 실패했습니다:', error);
      }
    };

    fetchBuildings();
  }, [neighborhoodId]);

  const handleConsultClick = () => {
    window.location.href = '/consultation';
  };

  return (
    <Container>
      <Title>건물을 선택해주세요</Title>
      <ConsultButton onClick={handleConsultClick}>
        <ChatIcon />
        상담신청
      </ConsultButton>
      <CustomLinkButton />
      <BuildingGrid>
        {buildings.map((building) => (
          <BuildingCard key={building._id} to={`/rooms/${building._id}`}>
            <BuildingImage 
              src={`${process.env.REACT_APP_API_URL || 'https://panorama-backend.onrender.com'}${building.imageUrl}`} 
              alt={building.name} 
            />
            <BuildingInfo>
              <BuildingName>{building.name}</BuildingName>
              <BuildingDescription>
                {building.address}<br />
                총 {building.floors}층
              </BuildingDescription>
            </BuildingInfo>
          </BuildingCard>
        ))}
      </BuildingGrid>
    </Container>
  );
};

export default BuildingList; 
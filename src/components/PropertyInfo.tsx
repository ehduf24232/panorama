import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoLabel = styled.span`
  font-weight: bold;
  color: #666;
`;

const InfoValue = styled.span`
  color: #333;
`;

const PropertyInfo: React.FC = () => {
  // 임시 데이터
  const propertyData = {
    title: '강남 신축 아파트',
    price: '12억 5,000만원',
    size: '84.9㎡ (25.7평)',
    rooms: '3개',
    bathrooms: '2개',
    location: '서울특별시 강남구',
    description: '2023년 신축된 고층 아파트입니다. 남향으로 조망이 좋으며, 지하철역과 가까운 위치에 있습니다.',
  };

  return (
    <Container>
      <Title>{propertyData.title}</Title>
      <InfoSection>
        <InfoLabel>가격</InfoLabel>
        <InfoValue>{propertyData.price}</InfoValue>
      </InfoSection>
      <InfoSection>
        <InfoLabel>면적</InfoLabel>
        <InfoValue>{propertyData.size}</InfoValue>
      </InfoSection>
      <InfoSection>
        <InfoLabel>방 개수</InfoLabel>
        <InfoValue>{propertyData.rooms}</InfoValue>
      </InfoSection>
      <InfoSection>
        <InfoLabel>화장실</InfoLabel>
        <InfoValue>{propertyData.bathrooms}</InfoValue>
      </InfoSection>
      <InfoSection>
        <InfoLabel>위치</InfoLabel>
        <InfoValue>{propertyData.location}</InfoValue>
      </InfoSection>
      <InfoSection>
        <InfoLabel>설명</InfoLabel>
        <InfoValue>{propertyData.description}</InfoValue>
      </InfoSection>
    </Container>
  );
};

export default PropertyInfo; 
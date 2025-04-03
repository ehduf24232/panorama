import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import PanoramaViewer from '../components/PanoramaViewer';
import { useData } from '../contexts/DataContext';
import axios from 'axios';
import HomeButton from '../components/HomeButton';
import api from '../api';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: #000;
`;

const MessageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #000;
  color: white;
  gap: 20px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  z-index: 1000;
`;

const ExitButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const BackButton = styled(ExitButton)`
  background-color: #0066cc;
  &:hover {
    background-color: #0052a3;
  }
`;

const PanoramaPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/api/rooms/${roomId}`);
        console.log('[방 데이터]:', response.data);
        console.log('[파노라마 데이터]:', response.data.panoramas);
        if (!response.data.panoramas || response.data.panoramas.length === 0) {
          console.log('[오류] 파노라마 이미지가 없습니다.');
        } else {
          console.log('[파노라마 URL들]:', response.data.panoramas.map((p: any) => p.url));
        }
        setRoom(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('방 정보 로딩 실패:', error);
        setError('파노라마 이미지를 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleExit = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <MessageContainer>
        <LoadingOverlay>파노라마를 불러오는 중...</LoadingOverlay>
      </MessageContainer>
    );
  }

  if (error || !room || !room.panoramas || room.panoramas.length === 0) {
    return (
      <MessageContainer>
        <div>{error || '이 방에는 등록된 파노라마 이미지가 없습니다.'}</div>
        <BackButton onClick={handleExit}>돌아가기</BackButton>
      </MessageContainer>
    );
  }

  return (
    <Container>
      <PanoramaViewer panoramas={room.panoramas} />
      <ExitButton onClick={handleExit}>나가기</ExitButton>
    </Container>
  );
};

export default PanoramaPage; 
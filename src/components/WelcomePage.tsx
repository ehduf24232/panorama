import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #fff 0%, #a8a8a8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.25rem;
  color: #a8a8a8;
  max-width: 600px;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const StartButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 2.5rem;
  border-radius: 25px;
  font-size: 1.1rem;
  color: #ffffff;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.9rem 2rem;
  }
`;

interface WelcomePageProps {
  onStart: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  return (
    <Container>
      <Title>파노라마 코리아</Title>
      <Description>
        360도 파노라마로 부동산을 미리 둘러보세요.
        실제와 같은 생생한 경험을 통해 공간을 더 자세히 확인할 수 있습니다.
      </Description>
      <StartButton onClick={onStart}>시작하기</StartButton>
    </Container>
  );
};

export default WelcomePage; 
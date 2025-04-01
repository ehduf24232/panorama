import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import HomeButton from '../components/HomeButton';
import CustomLinkButton from '../components/CustomLinkButton';

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
  max-width: 600px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #fff;
  text-align: center;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(153, 51, 255, 0.5);
  border-radius: 8px;
  font-size: 1rem;
  color: #fff;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: rgba(153, 51, 255, 0.8);
    box-shadow: 0 0 0 2px rgba(153, 51, 255, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(153, 51, 255, 0.5);
  border-radius: 8px;
  font-size: 1rem;
  color: #fff;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: rgba(153, 51, 255, 0.8);
    box-shadow: 0 0 0 2px rgba(153, 51, 255, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(153, 51, 255, 0.5);
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  color: #fff;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: rgba(153, 51, 255, 0.8);
    box-shadow: 0 0 0 2px rgba(153, 51, 255, 0.2);
  }
`;

const SubmitButton = styled.button`
  padding: 1rem;
  background-color: rgba(153, 51, 255, 0.3);
  color: white;
  border: 1px solid rgba(153, 51, 255, 0.5);
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s;
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

  &:hover {
    background-color: rgba(153, 51, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(153, 51, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL
});

const ConsultationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interest: '',
    budget: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/consultations', formData);
      alert('상담 신청이 완료되었습니다.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        interest: '',
        budget: '',
        message: ''
      });
    } catch (error) {
      console.error('상담 신청 중 오류가 발생했습니다:', error);
      alert('상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <HomeButton />
        <CustomLinkButton />
        <ContentWrapper>
          <Title>상담 신청</Title>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">이름</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="interest">관심분야</Label>
              <Select
                id="interest"
                name="interest"
                value={formData.interest}
                onChange={handleChange}
                required
              >
                <option value="">선택해주세요</option>
                <option value="아파트">아파트</option>
                <option value="주택">주택</option>
                <option value="상가">상가</option>
                <option value="공장">공장</option>
                <option value="토지">토지</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="budget">예산(만 원)</Label>
              <Input
                type="text"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="message">추가문의사항</Label>
              <TextArea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
              />
            </FormGroup>

            <SubmitButton type="submit">상담 신청하기</SubmitButton>
          </Form>
        </ContentWrapper>
      </Container>
    </>
  );
};

export default ConsultationPage; 
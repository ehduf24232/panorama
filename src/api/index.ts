import axios from 'axios';

const API_BASE_URL = 'https://panorama-backend.onrender.com';
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    // multipart/form-data 요청인 경우 Content-Type 헤더 제거
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 요청 오류:', error);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default api; 
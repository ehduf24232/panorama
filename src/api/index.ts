import axios from 'axios';

const API_BASE_URL = 'https://panorama-backend.onrender.com';
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://realestate-panorama.netlify.app',
    'Access-Control-Allow-Credentials': 'true'
  }
});

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
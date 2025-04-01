import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import neighborhoodRouter from './routes/neighborhoods';
import buildingRouter from './routes/buildings';
import roomRouter from './routes/rooms';
import consultationRouter from './routes/consultations';
import settingsRouter from './routes/settings';

dotenv.config();

const app = express();
const PORT = 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/panorama';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// 디버깅을 위한 미들웨어
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'https://realestate-panorama.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 설정
const uploadsDir = path.join(__dirname, '../uploads');
console.log('[정적 파일 설정] 업로드 디렉토리 경로:', uploadsDir);

// 업로드 디렉토리 생성
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('[정적 파일 설정] 업로드 디렉토리 생성됨');
}

// 정적 파일 요청 로깅 미들웨어
app.use((req, res, next) => {
  if (req.url.startsWith('/uploads')) {
    const filePath = path.join(uploadsDir, req.url.replace('/uploads', ''));
    console.log('[정적 파일 요청]', {
      요청URL: req.url,
      전체경로: filePath,
      존재여부: fs.existsSync(filePath)
    });
  }
  next();
});

// 정적 파일 제공
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '../../client/build')));

// 추가 CORS 헤더 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://realestate-panorama.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// API 라우트 설정
app.use('/api/neighborhoods', neighborhoodRouter);
app.use('/api/buildings', buildingRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/consultations', consultationRouter);
app.use('/api/settings', settingsRouter);

// 모든 요청을 React 앱으로 전달
app.get('*', (req, res) => {
  res.sendFile(path.join(path.join(__dirname, '../../client/build'), 'index.html'));
});

// 루트 경로 처리
app.get('/', (req, res) => {
  res.send('서버가 정상적으로 실행 중입니다.');
});

// 에러 핸들링 미들웨어
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[에러]', err);
  res.status(err.status || 500).json({
    message: err.message || '서버 에러가 발생했습니다.'
  });
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB에 연결되었습니다.');
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error);
  }); 
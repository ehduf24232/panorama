import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import neighborhoodRoutes from './routes/neighborhoods';
import buildingRoutes from './routes/buildings';
import roomRoutes from './routes/rooms';
import consultationRoutes from './routes/consultations';
import path from 'path';

const app = express();

// CORS 설정
app.use(cors({
  origin: ['https://realestate-panorama.netlify.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 라우트
app.use('/api/neighborhoods', neighborhoodRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/consultations', consultationRoutes);

// 기본 에러 핸들러
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

export default app; 
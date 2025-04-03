import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { GridFSBucket } from 'mongodb';

import neighborhoodRouter from './routes/neighborhoods';
import buildingRouter from './routes/buildings';
import roomRouter from './routes/rooms';
import consultationRouter from './routes/consultations';
import settingsRouter from './routes/settings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/panorama';

// CORS 설정
app.use(cors({
  origin: 'https://realestate-panorama.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 요청 헤더 로깅 미들웨어
app.use((req, res, next) => {
  console.log('[요청 URL]:', req.url);
  console.log('[요청 메서드]:', req.method);
  console.log('[요청 헤더]:', req.headers);
  
  res.header('Access-Control-Allow-Origin', 'https://realestate-panorama.netlify.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Credentials');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
let gfs: GridFSBucket;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB에 연결되었습니다.');
    
    // GridFS 설정
    const conn = mongoose.connection;
    if (!conn.db) {
      throw new Error('MongoDB 연결이 초기화되지 않았습니다.');
    }
    
    gfs = new GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });
    
    console.log('GridFS 버킷이 초기화되었습니다.');
    
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  })
  .catch((error) => {
    console.error('MongoDB 연결 에러:', error);
  });

// API 라우트 설정
app.use('/api/neighborhoods', neighborhoodRouter);
app.use('/api/buildings', buildingRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/consultations', consultationRouter);
app.use('/api/settings', settingsRouter);

// 이미지 조회 라우트
app.get('/api/images/:filename', async (req, res) => {
  try {
    const file = await gfs.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
    }

    const readStream = gfs.openDownloadStream(file[0]._id);
    readStream.pipe(res);
  } catch (error) {
    console.error('[이미지 조회 에러]:', error);
    res.status(500).json({ message: '이미지 조회에 실패했습니다.' });
  }
});

// 루트 경로 핸들러
app.get('/', (req, res) => {
  res.json({
    message: 'Panorama Backend API Server',
    status: 'running',
    endpoints: {
      neighborhoods: '/api/neighborhoods',
      buildings: '/api/buildings',
      rooms: '/api/rooms',
      consultations: '/api/consultations',
      settings: '/api/settings'
    }
  });
});

// 에러 핸들링 미들웨어
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[에러]', err);
  res.status(err.status || 500).json({
    message: err.message || '서버 에러가 발생했습니다.'
  });
});

export { gfs }; 
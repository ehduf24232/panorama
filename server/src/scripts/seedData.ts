import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv';
import Neighborhood from '../models/Neighborhood';
import Building from '../models/Building';
import Room from '../models/Room';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/panorama';

let gfs: GridFSBucket;

const defaultImages = {
  neighborhood: '/api/images/default-neighborhood.jpg',
  building: '/api/images/default-building.jpg',
  room: '/api/images/default-room.jpg'
};

async function uploadDefaultImage(filename: string): Promise<string> {
  const filePath = path.join(__dirname, `../assets/${filename}`);
  const readStream = fs.createReadStream(filePath);
  
  const uploadStream = gfs.openUploadStream(filename);
  readStream.pipe(uploadStream);
  
  return new Promise((resolve, reject) => {
    uploadStream.on('finish', () => {
      resolve(`/api/images/${filename}`);
    });
    uploadStream.on('error', reject);
  });
}

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB에 연결되었습니다.');

    // GridFS 버킷 초기화
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB 연결이 초기화되지 않았습니다.');
    }
    gfs = new GridFSBucket(db, {
      bucketName: 'uploads'
    });

    // 기본 이미지 업로드
    const defaultNeighborhoodImage = await uploadDefaultImage('default-neighborhood.jpg');
    const defaultBuildingImage = await uploadDefaultImage('default-building.jpg');
    const defaultRoomImage = await uploadDefaultImage('default-room.jpg');

    // 기존 데이터 삭제
    await Neighborhood.deleteMany({});
    await Building.deleteMany({});
    await Room.deleteMany({});

    // 샘플 데이터 생성
    const neighborhood = await Neighborhood.create({
      name: '테스트 동네',
      description: '테스트 동네 설명',
      imageUrl: defaultNeighborhoodImage
    });

    const building = await Building.create({
      name: '테스트 건물',
      description: '테스트 건물 설명',
      address: '서울시 강남구',
      neighborhood: neighborhood._id,
      imageUrl: defaultBuildingImage
    });

    await Room.create({
      name: '테스트 방',
      description: '테스트 방 설명',
      building: building._id,
      imageUrl: defaultRoomImage,
      panoramaUrls: [defaultRoomImage]
    });

    console.log('데이터 시딩이 완료되었습니다.');
  } catch (error) {
    console.error('데이터 시딩 중 에러 발생:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedData(); 
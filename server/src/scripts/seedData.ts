import mongoose from 'mongoose';
import Settings from '../models/Settings';
import Neighborhood from '../models/Neighborhood';
import Building from '../models/Building';
import Room from '../models/Room';

const MONGODB_URI = 'mongodb://localhost:27017/panorama';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB에 연결되었습니다.');

    // 기존 데이터 삭제
    await Settings.deleteMany({});
    await Neighborhood.deleteMany({});
    await Building.deleteMany({});
    await Room.deleteMany({});

    // 설정 데이터 추가
    await Settings.create({
      customLinkUrl: 'https://example.com',
      customLinkText: '회사 홈페이지'
    });

    // 동네 데이터 추가
    const neighborhood = await Neighborhood.create({
      name: '강남구',
      description: '서울특별시 강남구',
      imageUrl: '/uploads/neighborhoods/default.jpg'
    });

    // 건물 데이터 추가
    const building = await Building.create({
      name: '강남 빌라',
      description: '강남구에 위치한 빌라',
      neighborhoodId: neighborhood._id,
      imageUrl: '/uploads/buildings/default.jpg',
      floors: 5,
      address: '서울특별시 강남구 테스트로 123'
    });

    // 방 데이터 추가
    await Room.create({
      name: '1층 101호',
      description: '1층에 위치한 방',
      buildingId: building._id,
      imageUrl: '/uploads/rooms/default.jpg',
      panoramaUrl: '/uploads/panoramas/default.jpg',
      floor: 1,
      price: 50000000,
      size: 30,
      number: '101'
    });

    console.log('초기 데이터가 성공적으로 추가되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('데이터 추가 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

seedData(); 
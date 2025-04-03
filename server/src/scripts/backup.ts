import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Settings from '../models/Settings';
import Neighborhood from '../models/Neighborhood';
import Building from '../models/Building';
import Room from '../models/Room';

const MONGODB_URI = 'mongodb://localhost:27017/panorama';
const BACKUP_DIR = path.join(__dirname, '../../../backup');

async function createBackup() {
  try {
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB에 연결되었습니다.');

    // 백업 디렉토리 생성
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // 타임스탬프 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}`);
    fs.mkdirSync(backupPath);

    // 데이터 백업
    const settings = await Settings.find();
    const neighborhoods = await Neighborhood.find();
    const buildings = await Building.find();
    const rooms = await Room.find();

    // JSON 파일로 저장
    fs.writeFileSync(
      path.join(backupPath, 'settings.json'),
      JSON.stringify(settings, null, 2)
    );
    fs.writeFileSync(
      path.join(backupPath, 'neighborhoods.json'),
      JSON.stringify(neighborhoods, null, 2)
    );
    fs.writeFileSync(
      path.join(backupPath, 'buildings.json'),
      JSON.stringify(buildings, null, 2)
    );
    fs.writeFileSync(
      path.join(backupPath, 'rooms.json'),
      JSON.stringify(rooms, null, 2)
    );

    // uploads 디렉토리 백업
    const uploadsDir = path.join(__dirname, '../../uploads');
    const uploadsBackupDir = path.join(backupPath, 'uploads');
    
    if (fs.existsSync(uploadsDir)) {
      fs.cpSync(uploadsDir, uploadsBackupDir, { recursive: true });
      console.log('uploads 디렉토리 백업 완료');
    }

    // 백업 정보 저장
    const backupInfo = {
      timestamp: new Date().toISOString(),
      database: 'panorama',
      collections: ['settings', 'neighborhoods', 'buildings', 'rooms'],
      uploads: fs.existsSync(uploadsDir) ? true : false
    };

    fs.writeFileSync(
      path.join(backupPath, 'backup_info.json'),
      JSON.stringify(backupInfo, null, 2)
    );

    console.log('백업이 성공적으로 완료되었습니다.');
    console.log('백업 위치:', backupPath);
    process.exit(0);
  } catch (error) {
    console.error('백업 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

createBackup(); 
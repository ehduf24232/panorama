import express from 'express';
import Building from '../models/Building';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import { gfs } from '../index';

const router = express.Router();

// Multer 설정
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GridFS 버킷 초기화
let bucket: GridFSBucket | null = null;

// MongoDB 연결이 완료된 후 GridFS 버킷 초기화
mongoose.connection.once('open', () => {
  if (mongoose.connection.db) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    console.log('GridFS 버킷이 초기화되었습니다.');
  }
});

// 건물 목록 조회
router.get('/', async (req, res) => {
  try {
    const buildings = await Building.find();
    res.json(buildings);
  } catch (error: any) {
    console.error('건물 조회 에러:', error);
    if (error.response) {
      console.error('서버 응답:', error.response.data);
    }
    res.status(500).json({ success: false, message: '건물 조회 중 오류가 발생했습니다.' });
  }
});

// 동네별 건물 조회
router.get('/neighborhood/:neighborhoodId', async (req, res) => {
  try {
    console.log('[동네별 건물 조회] 동네 ID:', req.params.neighborhoodId);
    const buildings = await Building.find({ neighborhoodId: req.params.neighborhoodId });
    console.log('[동네별 건물 조회] 결과:', buildings);
    res.json(buildings);
  } catch (error) {
    console.error('[동네별 건물 조회 에러]:', error);
    res.status(500).json({ message: '건물 목록 조회에 실패했습니다.' });
  }
});

// 건물 추가
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('건물 추가 요청:', {
      body: req.body,
      file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

    const { name, neighborhoodId, address, floors } = req.body;

    // 필수 필드 검증
    if (!name || !neighborhoodId || !address || !floors) {
      console.error('필수 필드 누락:', { name, neighborhoodId, address, floors });
      return res.status(400).json({ 
        success: false, 
        message: '이름, 동네ID, 주소, 층수는 필수 입력 항목입니다.' 
      });
    }

    // 층수 숫자 검증
    if (isNaN(Number(floors))) {
      console.error('층수 형식 오류:', floors);
      return res.status(400).json({ 
        success: false, 
        message: '층수는 숫자여야 합니다.' 
      });
    }

    let imageUrl = '';
    if (req.file && bucket) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype
      });
      
      uploadStream.write(req.file.buffer);
      uploadStream.end();
      
      imageUrl = `/api/images/${filename}`;
      console.log('이미지 업로드 성공:', { filename, imageUrl });
    }

    const building = new Building({
      name,
      neighborhoodId,
      address,
      floors: Number(floors),
      imageUrl
    });

    const savedBuilding = await building.save();
    console.log('건물 저장 성공:', savedBuilding);
    
    res.status(201).json({ 
      success: true, 
      building: savedBuilding 
    });
  } catch (error: any) {
    console.error('건물 저장 에러:', error);
    if (error.response) {
      console.error('서버 응답:', error.response.data);
    }
    res.status(500).json({ 
      success: false, 
      message: '건물 저장 중 오류가 발생했습니다.' 
    });
  }
});

// 건물 수정
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, neighborhoodId, address, floors, description } = req.body;
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({ message: '건물을 찾을 수 없습니다.' });
    }

    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const writeStream = gfs.openUploadStream(filename, {
        contentType: req.file.mimetype
      });

      writeStream.write(req.file.buffer);
      writeStream.end();

      building.imageUrl = `/api/images/${filename}`;
    }

    building.name = name;
    building.neighborhoodId = neighborhoodId;
    building.address = address;
    building.floors = parseInt(floors);
    building.description = description;

    await building.save();
    res.json(building);
  } catch (error) {
    console.error('[건물 수정 에러]:', error);
    res.status(500).json({ message: '건물 수정에 실패했습니다.' });
  }
});

// 건물 삭제
router.delete('/:id', async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({ message: '건물을 찾을 수 없습니다.' });
    }

    if (building.imageUrl) {
      const filename = building.imageUrl.split('/').pop();
      if (filename) {
        const files = await gfs.find({ filename }).toArray();
        if (files.length > 0) {
          await gfs.delete(files[0]._id);
        }
      }
    }

    await building.deleteOne();
    res.json({ message: '건물이 삭제되었습니다.' });
  } catch (error) {
    console.error('[건물 삭제 에러]:', error);
    res.status(500).json({ message: '건물 삭제에 실패했습니다.' });
  }
});

// 이미지 조회
router.get('/images/:filename', async (req, res) => {
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

export default router; 
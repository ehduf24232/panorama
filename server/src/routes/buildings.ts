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

// 건물 목록 조회
router.get('/', async (req, res) => {
  try {
    const buildings = await Building.find();
    console.log('[건물 조회] 결과:', buildings);
    res.json(buildings);
  } catch (error) {
    console.error('[건물 조회 에러]:', error);
    res.status(500).json({ message: '건물 목록 조회에 실패했습니다.' });
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
    console.log('[건물 추가] 요청 본문:', JSON.stringify(req.body, null, 2));
    console.log('[건물 추가] 파일:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : '파일 없음');
    console.log('[건물 추가] 요청 헤더:', req.headers);
    
    const { name, neighborhoodId, address, floors, description } = req.body;
    
    // 필수 필드 검증
    if (!name || !neighborhoodId || !address || !floors) {
      console.error('[건물 추가 에러] 필수 필드 누락:', { 
        name, 
        neighborhoodId, 
        address, 
        floors,
        description 
      });
      return res.status(400).json({ 
        success: false,
        message: '필수 정보가 누락되었습니다.',
        missingFields: {
          name: !name,
          neighborhoodId: !neighborhoodId,
          address: !address,
          floors: !floors
        }
      });
    }

    // floors가 숫자인지 검증
    if (isNaN(parseInt(floors))) {
      console.error('[건물 추가 에러] 층수가 숫자가 아님:', floors);
      return res.status(400).json({ 
        success: false,
        message: '층수는 숫자여야 합니다.',
        invalidField: 'floors'
      });
    }

    let imageUrl = '';

    if (req.file) {
      try {
        const filename = `${Date.now()}-${req.file.originalname}`;
        console.log('[건물 추가] GridFS 파일명:', filename);
        
        const writeStream = gfs.openUploadStream(filename, {
          contentType: req.file.mimetype
        });

        writeStream.write(req.file.buffer);
        writeStream.end();

        imageUrl = `/api/images/${filename}`;
        console.log('[건물 추가] 이미지 URL:', imageUrl);
      } catch (error) {
        console.error('[건물 추가] 이미지 업로드 에러:', error);
        return res.status(500).json({ 
          success: false,
          message: '이미지 업로드에 실패했습니다.',
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
      }
    }

    console.log('[건물 추가] 데이터:', {
      name,
      neighborhoodId,
      address,
      floors,
      description,
      imageUrl
    });

    const building = new Building({
      name,
      neighborhoodId,
      address,
      floors: parseInt(floors),
      description,
      imageUrl
    });

    await building.save();
    console.log('[건물 추가] 저장된 건물:', building);
    res.status(201).json({
      success: true,
      data: building
    });
  } catch (error) {
    console.error('[건물 추가 에러]:', error);
    if (error instanceof Error) {
      console.error('[건물 추가 에러 상세]:', {
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({ 
      success: false,
      message: '건물 추가에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
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
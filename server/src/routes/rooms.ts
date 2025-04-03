import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Room from '../models/Room';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import { gfs } from '../index';
import Building from '../models/Building';

const router = Router();

// 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.fieldname === 'panoramas' ? 'uploads/panoramas' : 'uploads/rooms';
    const fullPath = path.join(__dirname, '../../', uploadDir);
    
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(fullPath)) {
      console.log(`[multer] 디렉토리 생성: ${fullPath}`);
      fs.mkdirSync(fullPath, { recursive: true });
    } else {
      console.log(`[multer] 디렉토리 존재: ${fullPath}`);
    }
    
    console.log(`[multer] 파일 저장 경로: ${fullPath}`);
    console.log(`[multer] 파일 정보:`, {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}${path.extname(file.originalname)}`;
    console.log(`[multer] 생성된 파일명: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB로 증가
    files: 11 // 메인 이미지 1개 + 파노라마 이미지 최대 10개
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (!file.mimetype.startsWith('image/')) {
      console.log(`[multer] 잘못된 파일 형식: ${file.mimetype}`);
      return cb(new Error('이미지 파일만 업로드할 수 있습니다.'));
    }
    console.log(`[multer] 파일 허용: ${file.originalname}`);
    cb(null, true);
  }
});

// 모든 방 조회
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ number: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: '방 목록을 가져오는데 실패했습니다.' });
  }
});

// 건물별 방 조회
router.get('/building/:buildingId', async (req, res) => {
  try {
    const rooms = await Room.find({ buildingId: req.params.buildingId }).sort({ number: 1 });
    res.json(rooms);
  } catch (error) {
    console.error('건물별 호실 목록 조회 에러:', error);
    res.status(500).json({ message: '호실 목록을 가져오는데 실패했습니다.' });
  }
});

// 단일 방 조회
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      console.log(`[방 조회 실패] ID ${req.params.id}를 찾을 수 없습니다.`);
      return res.status(404).json({ message: '방을 찾을 수 없습니다.' });
    }
    console.log('[방 조회 성공]:', JSON.stringify(room, null, 2));
    res.json(room);
  } catch (error) {
    console.error('[방 조회 에러]:', error);
    res.status(500).json({ message: '방 정보를 가져오는데 실패했습니다.' });
  }
});

// 방 추가
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'panoramas', maxCount: 10 }
]), async (req, res) => {
  try {
    console.log('[호실 등록] 요청 본문:', req.body);
    console.log('[호실 등록] 파일:', req.files);
    
    const { name, buildingId, roomNumber, size, price, floor, description, panoramaTags } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let imageUrl = '';
    if (files && files['image'] && files['image'][0]) {
      const file = files['image'][0];
      const filename = `${Date.now()}-${file.originalname}`;
      const uploadStream = gfs.openUploadStream(filename, {
        contentType: file.mimetype
      });
      
      // 파일 스트림을 사용하여 업로드
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(uploadStream);
      
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });
      
      imageUrl = `/api/images/${filename}`;
    }
    
    let panoramas: { url: string; tag: string }[] = [];
    if (files && files['panoramas']) {
      const tags = panoramaTags ? JSON.parse(panoramaTags) : [];
      for (let i = 0; i < files['panoramas'].length; i++) {
        const file = files['panoramas'][i];
        // 파일 이름에서 타임스탬프를 제거하고 원래 파일 이름만 사용
        const originalFilename = file.originalname;
        const uploadStream = gfs.openUploadStream(originalFilename, {
          contentType: file.mimetype
        });
        
        const fileStream = fs.createReadStream(file.path);
        fileStream.pipe(uploadStream);
        
        await new Promise((resolve, reject) => {
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
        });
        
        panoramas.push({
          url: `/api/images/${originalFilename}`,
          tag: tags[i] || ''
        });
      }
    }

    const room = new Room({
      name,
      buildingId,
      number: roomNumber,
      size: parseFloat(size),
      price: parseInt(price),
      floor: parseInt(floor),
      description,
      imageUrl,
      panoramas
    });

    await room.save();
    console.log('[호실 등록] 저장된 방 정보:', room);
    res.status(201).json(room);
  } catch (error) {
    console.error('[호실 등록 에러]:', error);
    res.status(500).json({ message: '방 추가에 실패했습니다.' });
  }
});

// 방 삭제
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: '방을 찾을 수 없습니다.' });
    }

    // 이미지 삭제
    if (room.imageUrl) {
      const filename = room.imageUrl.split('/').pop();
      if (filename) {
        const files = await gfs.find({ filename }).toArray();
        if (files.length > 0) {
          await gfs.delete(files[0]._id);
        }
      }
    }

    // 파노라마 이미지 삭제
    if (room.panoramas && room.panoramas.length > 0) {
      await Promise.all(room.panoramas.map(async (panorama) => {
        const filename = panorama.url.split('/').pop();
        if (filename) {
          const files = await gfs.find({ filename }).toArray();
          if (files.length > 0) {
            await gfs.delete(files[0]._id);
          }
        }
      }));
    }

    // 방 삭제
    await room.deleteOne();

    res.json({ message: '방이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '방 삭제에 실패했습니다.' });
  }
});

// 호실 수정
router.put('/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'panoramas', maxCount: 10 }
]), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: '호실을 찾을 수 없습니다.' });
    }

    const updateData: any = {
      name: req.body.name,
      buildingId: req.body.buildingId,
      number: req.body.number,
      size: req.body.size,
      price: parseInt(req.body.price),
      floor: parseInt(req.body.floor),
      description: req.body.description
    };

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // 새 이미지가 업로드된 경우
    if (files && files['image']) {
      // 기존 이미지 삭제
      if (room.imageUrl) {
        const filename = room.imageUrl.split('/').pop();
        if (filename) {
          const files = await gfs.find({ filename }).toArray();
          if (files.length > 0) {
            await gfs.delete(files[0]._id);
          }
        }
      }
      // 새 이미지 URL 설정
      const filename = `${Date.now()}-${files['image'][0].originalname}`;
      const writeStream = gfs.openUploadStream(filename, {
        contentType: files['image'][0].mimetype
      });
      writeStream.write(files['image'][0].buffer);
      writeStream.end();
      updateData.imageUrl = `/api/images/${filename}`;
    }

    // 새 파노라마가 업로드된 경우
    if (files && files['panoramas']) {
      // 기존 파노라마 파일들 삭제
      if (room.panoramas && room.panoramas.length > 0) {
        await Promise.all(room.panoramas.map(async (panorama) => {
          const filename = panorama.url.split('/').pop();
          if (filename) {
            const files = await gfs.find({ filename }).toArray();
            if (files.length > 0) {
              await gfs.delete(files[0]._id);
            }
          }
        }));
      }

      // 새 파노라마 URL과 태그 설정
      const panoramaTags = req.body.panoramaTags ? JSON.parse(req.body.panoramaTags) : [];
      updateData.panoramas = files['panoramas'].map((file, index) => ({
        url: `/api/images/${Date.now()}-${file.originalname}`,
        tag: panoramaTags[index] || ''
      }));
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    console.log('호실 수정:', updatedRoom);
    res.json(updatedRoom);
  } catch (error) {
    console.error('호실 수정 에러:', error);
    res.status(500).json({ message: '호실 수정에 실패했습니다.' });
  }
});

export default router; 
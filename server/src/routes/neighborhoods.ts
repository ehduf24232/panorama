import express from 'express';
import Neighborhood from '../models/Neighborhood';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import { gfs } from '../index';
import Building from '../models/Building';
import Room from '../models/Room';

const router = express.Router();

// Multer 설정
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 동네 목록 조회
router.get('/', async (req, res) => {
  try {
    const neighborhoods = await Neighborhood.find();
    console.log('[동네 조회] 결과:', neighborhoods);
    res.json(neighborhoods);
  } catch (error) {
    console.error('[동네 조회 에러]:', error);
    res.status(500).json({ message: '동네 목록 조회에 실패했습니다.' });
  }
});

// 동네 추가
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    let imageUrl = '';

    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const writeStream = gfs.openUploadStream(filename, {
        contentType: req.file.mimetype
      });

      writeStream.write(req.file.buffer);
      writeStream.end();

      imageUrl = `/api/images/${filename}`;
    }

    const neighborhood = new Neighborhood({
      name,
      description,
      imageUrl
    });

    await neighborhood.save();
    console.log('[동네 추가]', {
      '이름': name,
      '설명': description,
      '이미지URL': imageUrl
    });

    res.status(201).json(neighborhood);
  } catch (error) {
    console.error('[동네 추가 에러]:', error);
    res.status(500).json({ message: '동네 추가에 실패했습니다.' });
  }
});

// 동네 수정
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const neighborhood = await Neighborhood.findById(req.params.id);

    if (!neighborhood) {
      return res.status(404).json({ message: '동네를 찾을 수 없습니다.' });
    }

    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const writeStream = gfs.openUploadStream(filename, {
        contentType: req.file.mimetype
      });

      writeStream.write(req.file.buffer);
      writeStream.end();

      neighborhood.imageUrl = `/api/images/${filename}`;
    }

    neighborhood.name = name;
    neighborhood.description = description;

    await neighborhood.save();
    res.json(neighborhood);
  } catch (error) {
    console.error('[동네 수정 에러]:', error);
    res.status(500).json({ message: '동네 수정에 실패했습니다.' });
  }
});

// 동네 삭제
router.delete('/:id', async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);

    if (!neighborhood) {
      return res.status(404).json({ message: '동네를 찾을 수 없습니다.' });
    }

    if (neighborhood.imageUrl) {
      const filename = neighborhood.imageUrl.split('/').pop();
      if (filename) {
        const files = await gfs.find({ filename }).toArray();
        if (files.length > 0) {
          await gfs.delete(files[0]._id);
        }
      }
    }

    // 관련된 건물들 찾기
    const buildings = await Building.find({ neighborhoodId: req.params.id });

    // 각 건물에 속한 방들 삭제
    for (const building of buildings) {
      await Room.deleteMany({ buildingId: building._id });
    }

    // 건물들 삭제
    await Building.deleteMany({ neighborhoodId: req.params.id });

    // 동네 삭제
    await neighborhood.deleteOne();

    res.json({ message: '동네가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('[동네 삭제 에러]:', error);
    res.status(500).json({ message: '동네 삭제에 실패했습니다.' });
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

// 관련된 건물들 조회
router.get('/:id/buildings', async (req, res) => {
  try {
    const buildings = await Building.find({ neighborhoodId: req.params.id });
    res.json(buildings);
  } catch (error) {
    console.error('[건물 조회 에러]:', error);
    res.status(500).json({ message: '건물 조회에 실패했습니다.' });
  }
});

export default router; 
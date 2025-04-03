import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Neighborhood from '../models/Neighborhood';
import Building from '../models/Building';
import Room from '../models/Room';

const router = express.Router();

// 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/neighborhoods');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('[파일 업로드] 저장 경로:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}${path.extname(file.originalname)}`;
    console.log('[파일 업로드] 파일명:', filename);
    cb(null, filename);
  }
});

const upload = multer({ storage });

// 모든 동네 조회
router.get('/', async (req, res) => {
  try {
    const neighborhoods = await Neighborhood.find().sort({ name: 1 });
    console.log('[동네 조회] 결과:', neighborhoods);
    res.json(neighborhoods);
  } catch (error) {
    console.error('[동네 조회 에러]', error);
    res.status(500).json({ message: '동네 목록을 가져오는데 실패했습니다.' });
  }
});

// 동네 추가
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageUrl = req.file ? `/uploads/neighborhoods/${req.file.filename}` : '';
    
    console.log('[동네 추가]', {
      이름: name,
      설명: description,
      이미지URL: imageUrl,
      파일정보: req.file
    });

    const neighborhood = new Neighborhood({
      name,
      description,
      imageUrl
    });

    await neighborhood.save();
    res.status(201).json(neighborhood);
  } catch (error) {
    console.error('[동네 추가 에러]', error);
    res.status(500).json({ message: '동네 추가에 실패했습니다.' });
  }
});

// 동네 삭제
router.delete('/:id', async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);
    if (!neighborhood) {
      return res.status(404).json({ message: '동네를 찾을 수 없습니다.' });
    }

    // 이미지 파일 삭제
    if (neighborhood.imageUrl) {
      const imagePath = path.join(__dirname, '../../', neighborhood.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
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
    res.status(500).json({ message: '동네 삭제에 실패했습니다.' });
  }
});

// 동네 수정
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);
    if (!neighborhood) {
      return res.status(404).json({ message: '동네를 찾을 수 없습니다.' });
    }

    const updateData: any = {
      name: req.body.name,
      description: req.body.description
    };

    if (req.file) {
      // 기존 이미지가 있다면 삭제
      if (neighborhood.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', neighborhood.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // 새 이미지 URL 설정
      updateData.imageUrl = `/uploads/neighborhoods/${req.file.filename}`;
    }

    const updatedNeighborhood = await Neighborhood.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    console.log('동네 수정:', updatedNeighborhood);
    res.json(updatedNeighborhood);
  } catch (error) {
    console.error('동네 수정 에러:', error);
    res.status(500).json({ message: '동네 수정에 실패했습니다.' });
  }
});

export default router; 
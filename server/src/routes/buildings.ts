import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Building from '../models/Building';
import Room from '../models/Room';

const router = express.Router();

// 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/buildings';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// 모든 건물 조회
router.get('/', async (req, res) => {
  try {
    const buildings = await Building.find().sort({ name: 1 });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: '건물 목록을 가져오는데 실패했습니다.' });
  }
});

// 동네별 건물 조회
router.get('/neighborhood/:neighborhoodId', async (req, res) => {
  try {
    const buildings = await Building.find({ neighborhoodId: req.params.neighborhoodId }).sort({ name: 1 });
    res.json(buildings);
  } catch (error) {
    console.error('동네별 건물 목록 조회 에러:', error);
    res.status(500).json({ message: '건물 목록을 가져오는데 실패했습니다.' });
  }
});

// 건물 추가
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, neighborhoodId, address, floors, description } = req.body;
    const imageUrl = req.file ? `/uploads/buildings/${req.file.filename}` : '';

    const building = new Building({
      name,
      neighborhoodId,
      address,
      floors: parseInt(floors),
      description,
      imageUrl
    });

    await building.save();
    res.status(201).json(building);
  } catch (error) {
    res.status(500).json({ message: '건물 추가에 실패했습니다.' });
  }
});

// 건물 삭제
router.delete('/:id', async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ message: '건물을 찾을 수 없습니다.' });
    }

    // 이미지 파일 삭제
    if (building.imageUrl) {
      const imagePath = path.join(__dirname, '../../', building.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 관련된 방들 삭제
    await Room.deleteMany({ buildingId: req.params.id });

    // 건물 삭제
    await building.deleteOne();

    res.json({ message: '건물이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '건물 삭제에 실패했습니다.' });
  }
});

// 건물 수정
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ message: '건물을 찾을 수 없습니다.' });
    }

    const updateData: any = {
      name: req.body.name,
      neighborhoodId: req.body.neighborhoodId,
      address: req.body.address,
      floors: parseInt(req.body.floors),
      description: req.body.description
    };

    // 새 이미지가 업로드된 경우
    if (req.file) {
      // 기존 이미지 삭제
      if (building.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', building.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // 새 이미지 URL 설정
      updateData.imageUrl = `/uploads/buildings/${req.file.filename}`;
    }

    const updatedBuilding = await Building.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    console.log('건물 수정:', updatedBuilding);
    res.json(updatedBuilding);
  } catch (error) {
    console.error('건물 수정 에러:', error);
    res.status(500).json({ message: '건물 수정에 실패했습니다.' });
  }
});

export default router; 
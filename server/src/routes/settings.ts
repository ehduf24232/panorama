import express from 'express';
import Settings from '../models/Settings';

const router = express.Router();

// 설정 가져오기
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error('설정을 가져오는데 실패했습니다:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 설정 업데이트
router.put('/', async (req, res) => {
  try {
    const { customLinkUrl, customLinkText } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({ customLinkUrl, customLinkText });
    } else {
      settings.customLinkUrl = customLinkUrl;
      settings.customLinkText = customLinkText;
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('설정 업데이트에 실패했습니다:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 
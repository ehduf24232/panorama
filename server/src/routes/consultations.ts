import express from 'express';
import Consultation from '../models/Consultation';
import * as XLSX from 'xlsx';
import mongoose from 'mongoose';

const router = express.Router();

// 상담 신청 생성
router.post('/', async (req, res) => {
  try {
    // CORS 헤더 설정
    res.header('Access-Control-Allow-Origin', 'https://realestate-panorama.netlify.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const consultation = new Consultation(req.body);
    await consultation.save();
    res.status(201).json({ message: '상담 신청이 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('상담 신청 저장 중 오류:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: '입력하신 정보를 다시 확인해주세요.' });
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
  }
});

// 상담 신청 목록 조회 (관리자용)
router.get('/', async (req, res) => {
  try {
    // CORS 헤더 설정
    res.header('Access-Control-Allow-Origin', 'https://realestate-panorama.netlify.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    console.error('상담 신청 목록 조회 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 엑셀 내보내기
router.get('/export-excel', async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    
    // 엑셀 데이터 준비
    const excelData = consultations.map(consultation => ({
      이름: consultation.name,
      전화번호: consultation.phone,
      이메일: consultation.email,
      관심분야: consultation.interest,
      예산: consultation.budget,
      추가문의사항: consultation.message,
      신청일시: new Date(consultation.createdAt).toLocaleString('ko-KR')
    }));

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 열 너비 설정
    const colWidths = [
      { wch: 10 },  // 이름
      { wch: 15 },  // 전화번호
      { wch: 25 },  // 이메일
      { wch: 10 },  // 관심분야
      { wch: 15 },  // 예산
      { wch: 40 },  // 추가문의사항
      { wch: 20 },  // 신청일시
    ];
    ws['!cols'] = colWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '상담신청내역');

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 응답 헤더 설정
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=consultations.xlsx');
    
    // 파일 전송
    res.send(excelBuffer);
  } catch (error) {
    console.error('엑셀 파일 생성 중 오류:', error);
    res.status(500).json({ message: '엑셀 파일 생성 중 오류가 발생했습니다.' });
  }
});

export default router; 
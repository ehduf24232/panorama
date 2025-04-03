import express from 'express';
import Consultation from '../models/Consultation';
import * as XLSX from 'xlsx';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const consultation = new Consultation(req.body);
    await consultation.save();
    res.status(201).json({ message: '상담 신청이 완료되었습니다.' });
  } catch (error) {
    console.error('상담 신청 저장 중 오류:', error);
    res.status(500).json({ message: '상담 신청 중 오류가 발생했습니다.' });
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
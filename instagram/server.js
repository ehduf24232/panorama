const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
require('dotenv').config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate')
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// 상담 신청 스키마 정의
const ConsultationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  interest: String,
  budget: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Consultation = mongoose.model('Consultation', ConsultationSchema);

// API 엔드포인트
app.post('/api/consultations', async (req, res) => {
  try {
    const consultation = new Consultation(req.body);
    await consultation.save();
    res.status(201).json({ message: '상담 신청이 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('상담 신청 저장 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 엑셀 파일 내보내기 API
app.get('/api/export-excel', async (req, res) => {
  try {
    console.log('엑셀 내보내기 요청 받음');
    // 모든 상담 신청 데이터 조회
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    console.log('조회된 데이터 수:', consultations.length);
    
    // 데이터를 엑셀 형식으로 변환
    const data = consultations.map(consultation => ({
      '신청일시': new Date(consultation.createdAt).toLocaleString(),
      '이름': consultation.name,
      '전화번호': consultation.phone,
      '이메일': consultation.email,
      '관심분야': consultation.interest,
      '예산': consultation.budget,
      '추가문의사항': consultation.message
    }));

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // 열 너비 설정
    const colWidths = [
      { wch: 20 }, // 신청일시
      { wch: 10 }, // 이름
      { wch: 15 }, // 전화번호
      { wch: 25 }, // 이메일
      { wch: 15 }, // 관심분야
      { wch: 15 }, // 예산
      { wch: 30 }  // 추가문의사항
    ];
    ws['!cols'] = colWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '상담신청목록');

    // 파일 저장
    const fileName = `상담신청_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filePath = path.join(__dirname, fileName);
    XLSX.writeFile(wb, filePath);

    console.log('엑셀 파일 생성 완료:', filePath);

    // 파일 다운로드
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('파일 다운로드 중 오류 발생:', err);
      }
      // 파일 삭제
      require('fs').unlink(filePath, (err) => {
        if (err) {
          console.error('파일 삭제 중 오류 발생:', err);
        }
      });
    });
  } catch (error) {
    console.error('엑셀 내보내기 중 오류 발생:', error);
    res.status(500).json({ message: '엑셀 파일 생성 중 오류가 발생했습니다.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 
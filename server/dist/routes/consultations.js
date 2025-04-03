"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Consultation_1 = __importDefault(require("../models/Consultation"));
const XLSX = require('xlsx');
const router = express_1.default.Router();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const consultation = new Consultation_1.default(req.body);
        yield consultation.save();
        res.status(201).json({ message: '상담 신청이 완료되었습니다.' });
    }
    catch (error) {
        console.error('상담 신청 저장 중 오류:', error);
        res.status(500).json({ message: '상담 신청 중 오류가 발생했습니다.' });
    }
}));
// 엑셀 내보내기 라우트
router.get('/export-excel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const consultations = yield Consultation_1.default.find().sort({ createdAt: -1 });
        // 엑셀 데이터 준비
        const excelData = consultations.map(consultation => ({
            Name: consultation.name,
            Phone: consultation.phone,
            Email: consultation.email,
            Interest: consultation.interest,
            Budget: consultation.budget,
            Message: consultation.message,
            CreatedAt: new Date(consultation.createdAt).toLocaleString('ko-KR')
        }));
        // 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        // 열 너비 설정
        const colWidths = [
            { wch: 10 }, // Name
            { wch: 15 }, // Phone
            { wch: 25 }, // Email
            { wch: 10 }, // Interest
            { wch: 15 }, // Budget
            { wch: 40 }, // Message
            { wch: 20 }, // CreatedAt
        ];
        ws['!cols'] = colWidths;
        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(wb, ws, 'Consultations');
        // 엑셀 파일 생성
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        // 응답 헤더 설정
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=consultations.xlsx');
        // 파일 전송
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('엑셀 파일 생성 중 오류:', error);
        res.status(500).json({ message: '엑셀 파일 생성 중 오류가 발생했습니다.' });
    }
}));
exports.default = router;

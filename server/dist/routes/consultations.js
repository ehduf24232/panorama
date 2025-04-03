"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const XLSX = __importStar(require("xlsx"));
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
// 엑셀 내보내기
router.get('/export-excel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const consultations = yield Consultation_1.default.find().sort({ createdAt: -1 });
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
            { wch: 10 }, // 이름
            { wch: 15 }, // 전화번호
            { wch: 25 }, // 이메일
            { wch: 10 }, // 관심분야
            { wch: 15 }, // 예산
            { wch: 40 }, // 추가문의사항
            { wch: 20 }, // 신청일시
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
    }
    catch (error) {
        console.error('엑셀 파일 생성 중 오류:', error);
        res.status(500).json({ message: '엑셀 파일 생성 중 오류가 발생했습니다.' });
    }
}));
exports.default = router;

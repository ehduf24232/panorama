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
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Room_1 = __importDefault(require("../models/Room"));
const router = (0, express_1.Router)();
// 이미지 저장을 위한 multer 설정
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = file.fieldname === 'panoramas' ? 'uploads/panoramas' : 'uploads/rooms';
        const fullPath = path_1.default.join(__dirname, '../../', uploadDir);
        // 디렉토리가 없으면 생성
        if (!fs_1.default.existsSync(fullPath)) {
            console.log(`[multer] 디렉토리 생성: ${fullPath}`);
            fs_1.default.mkdirSync(fullPath, { recursive: true });
        }
        else {
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
        const filename = `${Date.now()}${path_1.default.extname(file.originalname)}`;
        console.log(`[multer] 생성된 파일명: ${filename}`);
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({
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
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield Room_1.default.find().sort({ number: 1 });
        res.json(rooms);
    }
    catch (error) {
        res.status(500).json({ message: '방 목록을 가져오는데 실패했습니다.' });
    }
}));
// 건물별 방 조회
router.get('/building/:buildingId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield Room_1.default.find({ buildingId: req.params.buildingId }).sort({ number: 1 });
        res.json(rooms);
    }
    catch (error) {
        console.error('건물별 호실 목록 조회 에러:', error);
        res.status(500).json({ message: '호실 목록을 가져오는데 실패했습니다.' });
    }
}));
// 단일 방 조회
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Room_1.default.findById(req.params.id);
        if (!room) {
            console.log(`[방 조회 실패] ID ${req.params.id}를 찾을 수 없습니다.`);
            return res.status(404).json({ message: '방을 찾을 수 없습니다.' });
        }
        console.log('[방 조회 성공]:', JSON.stringify(room, null, 2));
        res.json(room);
    }
    catch (error) {
        console.error('[방 조회 에러]:', error);
        res.status(500).json({ message: '방 정보를 가져오는데 실패했습니다.' });
    }
}));
// 방 추가
router.post('/', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'panoramas', maxCount: 10 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[호실 등록] 요청 본문:', req.body);
        console.log('[호실 등록] 파일:', req.files);
        const { name, buildingId, roomNumber, size, price, floor, description, panoramaTags } = req.body;
        const files = req.files;
        let imageUrl = '';
        if (files && files['image'] && files['image'][0]) {
            imageUrl = `/uploads/rooms/${path_1.default.basename(files['image'][0].path)}`;
            console.log('[호실 등록] 이미지 URL:', imageUrl);
        }
        let panoramas = [];
        if (files && files['panoramas']) {
            const tags = panoramaTags ? JSON.parse(panoramaTags) : [];
            panoramas = files['panoramas'].map((file, index) => ({
                url: `/uploads/panoramas/${path_1.default.basename(file.path)}`,
                tag: tags[index] || ''
            }));
            console.log('[호실 등록] 파노라마 URLs:', panoramas);
        }
        const room = new Room_1.default({
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
        yield room.save();
        console.log('[호실 등록] 저장된 방 정보:', room);
        res.status(201).json(room);
    }
    catch (error) {
        console.error('[호실 등록 에러]:', error);
        res.status(500).json({ message: '방 추가에 실패했습니다.' });
    }
}));
// 방 삭제
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Room_1.default.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: '방을 찾을 수 없습니다.' });
        }
        // 이미지 파일 삭제
        if (room.imageUrl) {
            const imagePath = path_1.default.join(__dirname, '../../', room.imageUrl);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        // 파노라마 파일들 삭제
        if (room.panoramas && room.panoramas.length > 0) {
            room.panoramas.forEach(panorama => {
                const panoramaPath = path_1.default.join(__dirname, '../../', panorama.url);
                if (fs_1.default.existsSync(panoramaPath)) {
                    fs_1.default.unlinkSync(panoramaPath);
                }
            });
        }
        // 방 삭제
        yield room.deleteOne();
        res.json({ message: '방이 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        res.status(500).json({ message: '방 삭제에 실패했습니다.' });
    }
}));
// 호실 수정
router.put('/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'panoramas', maxCount: 10 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Room_1.default.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: '호실을 찾을 수 없습니다.' });
        }
        const updateData = {
            name: req.body.name,
            buildingId: req.body.buildingId,
            number: req.body.number,
            size: req.body.size,
            price: parseInt(req.body.price),
            floor: parseInt(req.body.floor),
            description: req.body.description
        };
        const files = req.files;
        // 새 이미지가 업로드된 경우
        if (files && files['image']) {
            // 기존 이미지 삭제
            if (room.imageUrl) {
                const oldImagePath = path_1.default.join(__dirname, '../../', room.imageUrl);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                }
            }
            // 새 이미지 URL 설정
            updateData.imageUrl = `/uploads/rooms/${path_1.default.basename(files['image'][0].path)}`;
        }
        // 새 파노라마가 업로드된 경우
        if (files && files['panoramas']) {
            // 기존 파노라마 파일들 삭제
            if (room.panoramas && room.panoramas.length > 0) {
                room.panoramas.forEach(panorama => {
                    const oldPanoramaPath = path_1.default.join(__dirname, '../../', panorama.url);
                    if (fs_1.default.existsSync(oldPanoramaPath)) {
                        fs_1.default.unlinkSync(oldPanoramaPath);
                    }
                });
            }
            // 새 파노라마 URL과 태그 설정
            const panoramaTags = req.body.panoramaTags ? JSON.parse(req.body.panoramaTags) : [];
            updateData.panoramas = files['panoramas'].map((file, index) => ({
                url: `/uploads/panoramas/${path_1.default.basename(file.path)}`,
                tag: panoramaTags[index] || ''
            }));
        }
        const updatedRoom = yield Room_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        console.log('호실 수정:', updatedRoom);
        res.json(updatedRoom);
    }
    catch (error) {
        console.error('호실 수정 에러:', error);
        res.status(500).json({ message: '호실 수정에 실패했습니다.' });
    }
}));
exports.default = router;

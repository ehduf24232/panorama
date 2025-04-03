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
        const uploadDir = file.fieldname === 'panorama' ? 'uploads/panoramas' : 'uploads/rooms';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({ storage });
// 모든 방 조회
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield Room_1.default.find();
        res.json(rooms);
    }
    catch (error) {
        res.status(500).json({ message: '방 목록을 가져오는데 실패했습니다.' });
    }
}));
// 건물별 방 조회
router.get('/building/:buildingId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield Room_1.default.find({ buildingId: req.params.buildingId });
        res.json(rooms);
    }
    catch (error) {
        res.status(500).json({ message: '방 목록을 가져오는데 실패했습니다.' });
    }
}));
// 방 추가
router.post('/', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'panorama', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, buildingId, number, size, price, floor, description } = req.body;
        const files = req.files;
        const imageUrl = files.image ? `/uploads/rooms/${files.image[0].filename}` : '';
        const panoramaUrl = files.panorama ? `/uploads/panoramas/${files.panorama[0].filename}` : '';
        const room = new Room_1.default({
            name,
            buildingId,
            number,
            size,
            price: parseInt(price),
            floor: parseInt(floor),
            description,
            imageUrl,
            panoramaUrl
        });
        yield room.save();
        res.status(201).json(room);
    }
    catch (error) {
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
        // 이미지 파일들 삭제
        if (room.imageUrl) {
            const imagePath = path_1.default.join(__dirname, '../../', room.imageUrl);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        if (room.panoramaUrl) {
            const panoramaPath = path_1.default.join(__dirname, '../../', room.panoramaUrl);
            if (fs_1.default.existsSync(panoramaPath)) {
                fs_1.default.unlinkSync(panoramaPath);
            }
        }
        // 방 삭제
        yield room.deleteOne();
        res.json({ message: '방이 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        res.status(500).json({ message: '방 삭제에 실패했습니다.' });
    }
}));
exports.default = router;

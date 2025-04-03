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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Building_1 = __importDefault(require("../models/Building"));
const Room_1 = __importDefault(require("../models/Room"));
const router = express_1.default.Router();
// 이미지 저장을 위한 multer 설정
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/buildings';
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
// 모든 건물 조회
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const buildings = yield Building_1.default.find();
        res.json(buildings);
    }
    catch (error) {
        res.status(500).json({ message: '건물 목록을 가져오는데 실패했습니다.' });
    }
}));
// 동네별 건물 조회
router.get('/neighborhood/:neighborhoodId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const buildings = yield Building_1.default.find({ neighborhoodId: req.params.neighborhoodId });
        res.json(buildings);
    }
    catch (error) {
        res.status(500).json({ message: '건물 목록을 가져오는데 실패했습니다.' });
    }
}));
// 건물 추가
router.post('/', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, neighborhoodId, address, floors, description } = req.body;
        const imageUrl = req.file ? `/uploads/buildings/${req.file.filename}` : '';
        const building = new Building_1.default({
            name,
            neighborhoodId,
            address,
            floors: parseInt(floors),
            description,
            imageUrl
        });
        yield building.save();
        res.status(201).json(building);
    }
    catch (error) {
        res.status(500).json({ message: '건물 추가에 실패했습니다.' });
    }
}));
// 건물 삭제
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const building = yield Building_1.default.findById(req.params.id);
        if (!building) {
            return res.status(404).json({ message: '건물을 찾을 수 없습니다.' });
        }
        // 이미지 파일 삭제
        if (building.imageUrl) {
            const imagePath = path_1.default.join(__dirname, '../../', building.imageUrl);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        // 관련된 방들 삭제
        yield Room_1.default.deleteMany({ buildingId: req.params.id });
        // 건물 삭제
        yield building.deleteOne();
        res.json({ message: '건물이 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        res.status(500).json({ message: '건물 삭제에 실패했습니다.' });
    }
}));
exports.default = router;

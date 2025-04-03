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
const Neighborhood_1 = __importDefault(require("../models/Neighborhood"));
const Building_1 = __importDefault(require("../models/Building"));
const Room_1 = __importDefault(require("../models/Room"));
const router = express_1.default.Router();
// 이미지 저장을 위한 multer 설정
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../../uploads/neighborhoods');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('[파일 업로드] 저장 경로:', uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}${path_1.default.extname(file.originalname)}`;
        console.log('[파일 업로드] 파일명:', filename);
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({ storage });
// 모든 동네 조회
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const neighborhoods = yield Neighborhood_1.default.find();
        console.log('[동네 조회] 결과:', neighborhoods);
        res.json(neighborhoods);
    }
    catch (error) {
        console.error('[동네 조회 에러]', error);
        res.status(500).json({ message: '동네 목록을 가져오는데 실패했습니다.' });
    }
}));
// 동네 추가
router.post('/', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const imageUrl = req.file ? `/uploads/neighborhoods/${req.file.filename}` : '';
        console.log('[동네 추가]', {
            이름: name,
            설명: description,
            이미지URL: imageUrl,
            파일정보: req.file
        });
        const neighborhood = new Neighborhood_1.default({
            name,
            description,
            imageUrl
        });
        yield neighborhood.save();
        res.status(201).json(neighborhood);
    }
    catch (error) {
        console.error('[동네 추가 에러]', error);
        res.status(500).json({ message: '동네 추가에 실패했습니다.' });
    }
}));
// 동네 삭제
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const neighborhood = yield Neighborhood_1.default.findById(req.params.id);
        if (!neighborhood) {
            return res.status(404).json({ message: '동네를 찾을 수 없습니다.' });
        }
        // 이미지 파일 삭제
        if (neighborhood.imageUrl) {
            const imagePath = path_1.default.join(__dirname, '../../', neighborhood.imageUrl);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        // 관련된 건물들 찾기
        const buildings = yield Building_1.default.find({ neighborhoodId: req.params.id });
        // 각 건물에 속한 방들 삭제
        for (const building of buildings) {
            yield Room_1.default.deleteMany({ buildingId: building._id });
        }
        // 건물들 삭제
        yield Building_1.default.deleteMany({ neighborhoodId: req.params.id });
        // 동네 삭제
        yield neighborhood.deleteOne();
        res.json({ message: '동네가 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        res.status(500).json({ message: '동네 삭제에 실패했습니다.' });
    }
}));
exports.default = router;

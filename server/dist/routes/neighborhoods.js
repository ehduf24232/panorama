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
const Neighborhood_1 = __importDefault(require("../models/Neighborhood"));
const multer_1 = __importDefault(require("multer"));
const index_1 = require("../index");
const Building_1 = __importDefault(require("../models/Building"));
const Room_1 = __importDefault(require("../models/Room"));
const router = express_1.default.Router();
// Multer 설정
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// 동네 목록 조회
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const neighborhoods = yield Neighborhood_1.default.find();
        console.log('[동네 조회] 결과:', neighborhoods);
        res.json(neighborhoods);
    }
    catch (error) {
        console.error('[동네 조회 에러]:', error);
        res.status(500).json({ message: '동네 목록 조회에 실패했습니다.' });
    }
}));
// 동네 추가
router.post('/', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        let imageUrl = '';
        if (req.file) {
            const filename = `${Date.now()}-${req.file.originalname}`;
            const writeStream = index_1.gfs.openUploadStream(filename, {
                contentType: req.file.mimetype
            });
            writeStream.write(req.file.buffer);
            writeStream.end();
            imageUrl = `/api/images/${filename}`;
        }
        const neighborhood = new Neighborhood_1.default({
            name,
            description,
            imageUrl
        });
        yield neighborhood.save();
        console.log('[동네 추가]', {
            '이름': name,
            '설명': description,
            '이미지URL': imageUrl
        });
        res.status(201).json(neighborhood);
    }
    catch (error) {
        console.error('[동네 추가 에러]:', error);
        res.status(500).json({ message: '동네 추가에 실패했습니다.' });
    }
}));
// 동네 수정
router.put('/:id', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const neighborhood = yield Neighborhood_1.default.findById(req.params.id);
        if (!neighborhood) {
            return res.status(404).json({ message: '동네를 찾을 수 없습니다.' });
        }
        if (req.file) {
            const filename = `${Date.now()}-${req.file.originalname}`;
            const writeStream = index_1.gfs.openUploadStream(filename, {
                contentType: req.file.mimetype
            });
            writeStream.write(req.file.buffer);
            writeStream.end();
            neighborhood.imageUrl = `/api/images/${filename}`;
        }
        neighborhood.name = name;
        neighborhood.description = description;
        yield neighborhood.save();
        res.json(neighborhood);
    }
    catch (error) {
        console.error('[동네 수정 에러]:', error);
        res.status(500).json({ message: '동네 수정에 실패했습니다.' });
    }
}));
// 동네 삭제
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const neighborhood = yield Neighborhood_1.default.findById(req.params.id);
        if (!neighborhood) {
            return res.status(404).json({ message: '동네를 찾을 수 없습니다.' });
        }
        if (neighborhood.imageUrl) {
            const filename = neighborhood.imageUrl.split('/').pop();
            if (filename) {
                const files = yield index_1.gfs.find({ filename }).toArray();
                if (files.length > 0) {
                    yield index_1.gfs.delete(files[0]._id);
                }
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
        console.error('[동네 삭제 에러]:', error);
        res.status(500).json({ message: '동네 삭제에 실패했습니다.' });
    }
}));
// 이미지 조회
router.get('/images/:filename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = yield index_1.gfs.find({ filename: req.params.filename }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
        }
        const readStream = index_1.gfs.openDownloadStream(file[0]._id);
        readStream.pipe(res);
    }
    catch (error) {
        console.error('[이미지 조회 에러]:', error);
        res.status(500).json({ message: '이미지 조회에 실패했습니다.' });
    }
}));
// 관련된 건물들 조회
router.get('/:id/buildings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const buildings = yield Building_1.default.find({ neighborhoodId: req.params.id });
        res.json(buildings);
    }
    catch (error) {
        console.error('[건물 조회 에러]:', error);
        res.status(500).json({ message: '건물 조회에 실패했습니다.' });
    }
}));
exports.default = router;

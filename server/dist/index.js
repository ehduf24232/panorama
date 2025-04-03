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
exports.gfs = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const neighborhoods_1 = __importDefault(require("./routes/neighborhoods"));
const buildings_1 = __importDefault(require("./routes/buildings"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const consultations_1 = __importDefault(require("./routes/consultations"));
const settings_1 = __importDefault(require("./routes/settings"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/panorama';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
// 디버깅을 위한 미들웨어
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// CORS 설정
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// 기본 미들웨어
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 정적 파일 제공 설정
const uploadsPath = path_1.default.join(__dirname, '../uploads');
console.log('[정적 파일 설정] 업로드 디렉토리 경로:', uploadsPath);
// 업로드 디렉토리 생성
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
    console.log('[정적 파일 설정] 업로드 디렉토리 생성됨');
}
// 정적 파일 요청 로깅 미들웨어
app.use((req, res, next) => {
    if (req.url.startsWith('/uploads')) {
        const filePath = path_1.default.join(uploadsPath, req.url.replace('/uploads', ''));
        console.log('[정적 파일 요청]', {
            요청URL: req.url,
            전체경로: filePath,
            존재여부: fs_1.default.existsSync(filePath)
        });
    }
    next();
});
// 정적 파일 제공
app.use('/uploads', express_1.default.static(uploadsPath, {
    fallthrough: false,
    index: false
}));
// 정적 파일 에러 핸들링
app.use((err, req, res, next) => {
    if (err.code === 'ENOENT') {
        console.error('[정적 파일 에러] 파일을 찾을 수 없음:', req.url);
        res.status(404).send('파일을 찾을 수 없습니다.');
    }
    else {
        next(err);
    }
});
// MongoDB 연결
let gfs;
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('MongoDB에 연결되었습니다.');
    // GridFS 설정
    const conn = mongoose_1.default.connection;
    if (!conn.db) {
        throw new Error('MongoDB 연결이 초기화되지 않았습니다.');
    }
    exports.gfs = gfs = new mongodb_1.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    console.log('GridFS 버킷이 초기화되었습니다.');
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
})
    .catch((error) => {
    console.error('MongoDB 연결 에러:', error);
});
// API 라우트 설정
app.use('/api/neighborhoods', neighborhoods_1.default);
app.use('/api/buildings', buildings_1.default);
app.use('/api/rooms', rooms_1.default);
app.use('/api/consultations', consultations_1.default);
app.use('/api/settings', settings_1.default);
// React 앱 제공
const clientBuildPath = path_1.default.join(__dirname, '../../build');
app.use(express_1.default.static(clientBuildPath));
// 모든 요청을 React 앱으로 전달
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(clientBuildPath, 'index.html'));
});
// 루트 경로 처리
app.get('/', (req, res) => {
    res.json({
        message: 'Panorama Backend API Server',
        status: 'running',
        endpoints: {
            neighborhoods: '/api/neighborhoods',
            buildings: '/api/buildings',
            rooms: '/api/rooms',
            consultations: '/api/consultations',
            settings: '/api/settings'
        }
    });
});
// 이미지 조회 라우트
app.get('/api/images/:filename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = yield gfs.find({ filename: req.params.filename }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
        }
        const readStream = gfs.openDownloadStream(file[0]._id);
        readStream.pipe(res);
    }
    catch (error) {
        console.error('[이미지 조회 에러]:', error);
        res.status(500).json({ message: '이미지 조회에 실패했습니다.' });
    }
}));
// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error('[에러]', err);
    res.status(err.status || 500).json({
        message: err.message || '서버 에러가 발생했습니다.'
    });
});

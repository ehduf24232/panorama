"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const neighborhoods_1 = __importDefault(require("./routes/neighborhoods"));
const buildings_1 = __importDefault(require("./routes/buildings"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const consultations_1 = __importDefault(require("./routes/consultations"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// 디버깅을 위한 미들웨어
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// CORS 설정
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
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
// API 라우트 설정
app.use('/api/neighborhoods', neighborhoods_1.default);
app.use('/api/buildings', buildings_1.default);
app.use('/api/rooms', rooms_1.default);
app.use('/api/consultations', consultations_1.default);
// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error('[에러]', err);
    res.status(err.status || 500).json({
        message: err.message || '서버 에러가 발생했습니다.'
    });
});
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/panorama';
const PORT = process.env.PORT || 5000;
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('MongoDB에 연결되었습니다.');
    app.listen(PORT, () => {
        console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
})
    .catch((error) => {
    console.error('MongoDB 연결 실패:', error);
});

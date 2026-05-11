const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
// 서버가 현재 폴더의 정적 파일(index.html 등)을 읽을 수 있게 설정
app.use(express.static(__dirname));

const DATA_FILE = 'data.json';

// 서버 시작 시 기존 데이터 불러오기 (해시 테이블 역할)
let db = {};
if (fs.existsSync(DATA_FILE)) {
    try {
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');
        db = JSON.parse(fileData);
    } catch (e) {
        console.error("데이터 파일 읽기 오류:", e);
        db = {};
    }
}

// [메인 페이지] 접속 시 index.html 전송
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// [API] 밥약 신청
app.post('/api/apply', (req, res) => {
    const { studentId, name, menu } = req.body;
    
    if (!studentId || !name || !menu) {
        return res.status(400).json({ message: "모든 정보를 입력해주세요." });
    }

    if (!/^\d{8,10}$/.test(studentId)) {
        return res.status(400).json({ message: "학번은 8~10자리 숫자여야 합니다." });
    }

    if (db[studentId]) {
        return res.status(400).json({ message: "이미 신청된 학번입니다." });
    }
    
    // 데이터 저장 (Key: 학번)
    db[studentId] = { name, menu, time: new Date().toLocaleString('ko-KR') };
    
    // 파일에 저장 (데이터 보존)
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    
    res.json({ message: "✅ 신청이 완료되었습니다!" });
});

// [API] 전체 목록 조회
app.get('/api/list', (req, res) => {
    const allData = Object.keys(db).map(key => ({
        studentId: key,
        ...db[key]
    }));
    res.json(allData);
});

// 포트 설정 (Render 환경 대응)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 작동 중입니다.`);
});

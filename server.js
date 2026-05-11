const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 파일 시스템 모듈 추가
const app = express();

app.use(cors());
app.use(express.json());

const DATA_FILE = 'data.json';

// 1. 파일에서 데이터 로드 (서버 시작 시 실행)
let db = {};
if (fs.existsSync(DATA_FILE)) {
    const fileData = fs.readFileSync(DATA_FILE);
    db = JSON.parse(fileData);
}

// 2. 신청 API
app.post('/api/apply', (req, res) => {
    const { studentId, name, menu } = req.body;

    if (db[studentId]) {
        return res.status(400).json({ message: "이미 신청된 학번입니다." });
    }

    // 데이터 추가
    db[studentId] = { name, menu, time: new Date().toLocaleString() };

    // 3. 파일에 즉시 저장 (컴퓨터가 꺼져도 안전함)
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));

    res.json({ message: "밥약 신청이 완료되었습니다!" });
});

// 전체 목록 조회 API
app.get('/api/list', (req, res) => {
    const allData = Object.keys(db).map(key => ({ studentId: key, ...db[key] }));
    res.json(allData);
});

app.listen(3000, () => console.log('서버 실행 중...'));
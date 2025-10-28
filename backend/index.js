const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createPool({
  host: 'db',
  user: 'root',
  password: '1234',
  database: 'mydb'
});

// DB 연결 대기
async function connectDB() {
  try {
    await db.query('SELECT 1'); //DB 연결 상태 확인
    await db.query('CREATE TABLE IF NOT EXISTS counter (value INT)');
    await db.query('INSERT INTO counter SELECT 0 WHERE NOT EXISTS (SELECT * FROM counter)'); //테이블 아무것도 없을시 0 넣기
    console.log('DB 연결 완료');
  } catch (err) {
    console.log('DB 연결 재시도...');
    setTimeout(connectDB, 3000);
  }
}
connectDB();

// 버튼 숫자 상승값 프론트엔드로 json으로 내용전달
app.post('/click', async (req, res) => {
  await db.query('UPDATE counter SET value = value + 1');
  const [rows] = await db.query('SELECT value FROM counter');
  res.json({ count: rows[0].value });
});

app.listen(4000, () => console.log('백엔드 4000포트 실행'));
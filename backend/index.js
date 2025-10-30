const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());

const mydb = mysql.createPool({
  host: 'db',
  user: 'root',
  password: '1234',
  database: 'mydb'
});

// DB 연결 대기
async function connectDB() {
  try {
    await mydb.query('SELECT 1'); //DB 연결 상태 확인
    await mydb.query('CREATE TABLE IF NOT EXISTS counter (value INT)');
    await mydb.query('INSERT INTO counter SELECT 0 WHERE NOT EXISTS (SELECT * FROM counter)'); //테이블 아무것도 없을시 0 넣기
    console.log('DB 연결 완료');
    return true;
  } catch (err) {
    console.log('DB 연결 재시도...');
    await new Promise(resolve => setTimeout(resolve,3000))
    return connectDB();
  }
}

// 버튼 숫자 상승값 프론트엔드로 json으로 내용전달
app.post('/click', async (req, res) => {
  await mydb.query('UPDATE counter SET value = value + 1');
  const [rows] = await mydb.query('SELECT value FROM counter');
  res.json({ count: rows[0].value });
});

// 버튼 숫자 감소값 프론트엔드로 json으로 내용전달
app.post('/decrease', async (req, res) => {
  await mydb.query('UPDATE counter SET value = value - 1');
  const [rows] = await mydb.query('SELECT value FROM counter');
  res.json({ count: rows[0].value });
});

connectDB().then(() =>{
  app.listen(4000, () => console.log('백엔드 4000포트 실행'));
})

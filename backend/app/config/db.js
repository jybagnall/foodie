import dotenv from "dotenv";
dotenv.config(); // .env 파일을 실제로 메모리에 로드함?
import pkg from "pg"; // PostgreSQL과 연결하기 위한 pg 라이브러리

const { Pool } = pkg;
const useSSL = process.env.DB_SSL === "true";

// DB 연결 관리자 pool이 생성됨.
// pool 안에는 여러 개의 DB 연결이 미리 만들어져 있고,
// 쿼리 실행시 놀고 있는 커넥션이 랜덤으로 픽됨
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  max: 10, // 최대 10개의 DB 커넥션까지만 동시에 유지
  idleTimeoutMillis: 30000, // 30초 동안 안 쓰인 커넥션은 자동 종료
  connectionTimeoutMillis: 20000, // DB 연결 시도 시 20초 넘으면 실패 처리
});

// DB 연결을 최대 10번까지 재시도하는 함수
async function connectWithRetry(retries = 10, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect(); // pool에서 커넥션 하나 빌려옴
      console.log("Successfully connected to PostgreSQL database!");
      client.release(); // 사용한 커넥션을 다시 pool에 반납
      break; // 성공했으니 반복 종료
    } catch (err) {
      console.error(
        `⛔Attempt ${attempt} failed to connect:`,
        err.code || err.message,
      );
      if (attempt === retries) {
        console.error("Exceeded max retries. Exiting.");
        process.exit(1); // Crash app if DB is unavailable
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

connectWithRetry();

export default pool;

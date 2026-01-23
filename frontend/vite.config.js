import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 로컬에서 Vite가 어떻게 실행될지를 지정함.
    host: "0.0.0.0", // 필수! 브라우저에서 Docker 환경에 접속을 허용.
    port: 5173, // Vite 개발 서버가 열릴 포트 번호
    proxy: {
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
        secure: false,
      }, // 프론트엔드가 백엔드 API로 요청을 보낼 때, CORS 문제 없이 연결
    },
  },
});

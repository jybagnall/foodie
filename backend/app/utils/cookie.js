export function setRefreshTokenCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // 프론트에서 refreshToken을 직접 못 읽음, JS는 접근 금지
    secure: process.env.NODE_ENV === "production", // HTTPS(암호화된 통신)에서만 전송
    sameSite: "Strict", // 다른 사이트에서 요청 오면 쿠키 안 보냄
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 DAYS
  });
}

// 브라우저 쿠키에 저장, but JS는 접근 못하고 서버 요청 시에만 첨부됨.
// 액세스 토큰 재발급시, withCredentials: true (브라우저에게 쿠키 포함 요청) →
// 서버는 req.cookies.refreshToken으로 읽음

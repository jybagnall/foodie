import React, { useState, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import Client, { RefreshTokenExpiredError } from "../services/client";
import AccountService from "../services/account.service";

// refresh 실패 시 → logout, 성공 시 → state 갱신, Client 에러 타입 해석
const AuthContext = React.createContext({
  accessToken: null, // 메모리에만 저장됨, XSS 공격 방지
  decodedUser: null,
  isAuthLoading: true,
  applyAccessToken: () => {},
  logout: () => {},
  setAccessToken: () => {},
  setDecodedUser: () => {},
});

// router.post("/refresh-access-token" ...) 이해해야 됨
export function AuthContextProvider({ children }) {
  const publicRoutes = new Set(["/", "/login", "/signup"]);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [decodedUser, setDecodedUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 확인

  // Cookies.set("refreshToken")은 XSS 공격 시 탈취될 수 있음.
  // 로그인 & 회원가입 성공 시, 토큰 갱신 시 적용됨.
  const applyAccessToken = useCallback(async (accessToken) => {
    try {
      setAccessToken(accessToken);
      const decoded = jwtDecode(accessToken);
      setDecodedUser(decoded);

      if (decoded.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("applyAccessToken error:", err.message);
      setDecodedUser(null);
    }
  }, []);

  // 쿠키 삭제는 서버에서 함
  // 로그아웃 정책을 정의
  const logout = useCallback(async () => {
    const abortController = new AbortController();
    const accountService = new AccountService(abortController, {});

    try {
      await accountService.logoutUser(); // 서버에서 refreshToken 쿠키 삭제.
    } finally {
      setAccessToken(null);
      setDecodedUser(null);
      navigate("/login");
    }
  }, [navigate]);

  // restoreAccessToken
  // 액세스 토큰이 있다 = 로그인 상태,
  // 액세스 토큰이 없는데 + refresh 성공 = 로그인 유지
  // refresh token 쿠키를 이용해서 새 accessToken 하나만 재발급

  // 액세스 토큰이 없는데 + refresh 실패 = 로그아웃
  // ❗앱 시작시 액세스 토큰이 없다면 자동 실행
  const restoreUserSession = useCallback(async () => {
    const abortController = new AbortController();
    const client = new Client(abortController, { accessToken });

    try {
      const newAccessToken = await client.refreshAccessToken();
      applyAccessToken(newAccessToken);
    } catch (err) {
      if (err instanceof RefreshTokenExpiredError) {
        logout();
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, [accessToken, applyAccessToken, logout]); //

  useEffect(() => {
    // 로그인 상태여야 볼 수 있는 페이지인데 토큰이 없다면
    if (isAuthLoading && !accessToken && !publicRoutes.has(location.pathname)) {
      restoreUserSession(); // 자동 로그인 로직 수행
    } else {
      setIsAuthLoading(false);
    } // 공개 페이지이거나 액세스 토큰이 있는 상태이므로, 로딩 상태 종료
  }, [location.pathname]); // 페이지 이동 시 토큰 검증이 필요할 수 있음

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        decodedUser,
        isAuthLoading,
        applyAccessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

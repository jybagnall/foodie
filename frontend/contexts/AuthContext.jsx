import React, { useState, useCallback, useEffect, useRef } from "react";
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
  handleLoginSuccess: () => {},
  logout: () => {},
});

export function AuthContextProvider({ children }) {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [decodedUser, setDecodedUser] = useState(null);
  const hasTriedRestoreRef = useRef(false);
  const refreshTimerRef = useRef(null);
  const navigate = useNavigate();

  // Cookies.set("refreshToken")은 XSS 공격 시 탈취될 수 있음.
  // 토큰 갱신 시 적용됨.
  const applyAccessToken = useCallback((accessToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      setAccessToken(accessToken);
      setDecodedUser(decoded);
      return decoded;
    } catch (err) {
      console.error("applyAccessToken error:", err.message);
      setDecodedUser(null);
      return null;
    }
  }, []);

  const handleLoginSuccess = useCallback(
    (accessToken) => {
      const decoded = applyAccessToken(accessToken);
      if (!decoded) return;

      navigate(decoded.role === "admin" ? "/admin" : "/");
    },
    [applyAccessToken],
  );

  // 쿠키 삭제는 서버에서 함
  // 로그아웃 정책을 정의
  const logout = useCallback(async () => {
    const abortController = new AbortController();
    const accountService = new AccountService(abortController);

    await accountService.logoutUser(); // 서버에서 refreshToken 쿠키 삭제.
    setAccessToken(null);
    setDecodedUser(null);
    navigate("/");
  }, []);

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
        setAccessToken(null);
        setDecodedUser(null);
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, [accessToken, applyAccessToken, logout]);

  useEffect(() => {
    if (hasTriedRestoreRef.current) return;

    // app mounts or page is refreshed
    hasTriedRestoreRef.current = true;

    if (!accessToken) {
      restoreUserSession();
    }
  }, []);

  // ❗As long as an accessToken exists, a timer is set so that
  // restoreUserSession() is automatically executed right before the token expires.
  useEffect(() => {
    // After logout or before login, accessToken doesn't exist.
    // Don't set the timer.
    if (!accessToken) return;

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const decoded = jwtDecode(accessToken);
    const timeout = decoded.exp * 1000 - Date.now() - 30_000;
    // 30 secs before token expires

    if (timeout > 0) {
      refreshTimerRef.current = setTimeout(() => {
        restoreUserSession();
      }, timeout);

      return () => clearTimeout(refreshTimerRef.current);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        decodedUser,
        isAuthLoading,
        applyAccessToken,
        handleLoginSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

import React, { useState, useCallback, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Client, { RefreshTokenExpiredError } from "../services/client";
import AccountService from "../services/account.service";
import { authEvents } from "../utils/authEvents";
import { useCartSync } from "../hooks/useCartSync";

// refresh 실패 시 → logout, 성공 시 → state 갱신, Client 에러 타입 해석
const AuthContext = React.createContext({
  accessToken: null, // 메모리에만 저장됨, XSS 공격 방지
  decodedUser: null,
  isAuthLoading: true,
  handleLoginSuccess: () => {},
  logout: () => {},
});

export function AuthContextProvider({ children }) {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [decodedUser, setDecodedUser] = useState(null);

  const hasTriedRestoreRef = useRef(false);
  const refreshTimerRef = useRef(null);
  const logoutAbortRef = useRef(null);
  const restoreSessionAbortRef = useRef(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useCartSync(accessToken);

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
    async (accessToken) => {
      const decoded = applyAccessToken(accessToken);
      if (!decoded) return;

      navigate(decoded.role === "admin" ? "/admin" : "/");
    },
    [applyAccessToken],
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setDecodedUser(null);
    queryClient.removeQueries({ queryKey: ["addressBook"] });
    queryClient.removeQueries({ queryKey: ["defaultAddress"] });
    queryClient.removeQueries({ queryKey: ["orders"] });
    queryClient.removeQueries({ queryKey: ["user", "me"] });
  }, [queryClient]);

  // 쿠키 삭제는 서버에서 함
  const logout = useCallback(async () => {
    logoutAbortRef.current?.abort();
    logoutAbortRef.current = new AbortController();
    const accountService = new AccountService(logoutAbortRef.current.signal);

    try {
      await accountService.logoutUser(); // 서버에서 refreshToken 쿠키 삭제.
    } catch (err) {
      console.error(err);
    } finally {
      clearSession();
      navigate("/");
    }
  }, [clearSession]);

  // 액세스 토큰이 있다 = 로그인 상태,
  // 액세스 토큰이 없는데 refresh 성공 = 로그인 유지
  // 액세스 토큰이 없는데 refresh 실패 = 로그아웃

  // ❗앱 시작시 액세스 토큰이 없다면 자동 실행
  const restoreUserSession = useCallback(async () => {
    restoreSessionAbortRef.current?.abort();
    restoreSessionAbortRef.current = new AbortController();
    const client = new Client(restoreSessionAbortRef.signal, () => accessToken);

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
  }, [applyAccessToken]);

  useEffect(() => {
    if (hasTriedRestoreRef.current) return;

    // app mounts or page is refreshed
    hasTriedRestoreRef.current = true;

    if (!accessToken) {
      restoreUserSession();
    }
  }, [restoreUserSession]);

  // ❗As long as an accessToken exists, a timer is set so that
  // restoreUserSession() is automatically executed right before the token expires.
  useEffect(() => {
    // After logout or before login, accessToken doesn't exist.
    // Don't set the timer.
    if (!accessToken) return;

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

  useEffect(() => {
    const onTokenRefreshed = (e) => applyAccessToken(e.detail);
    const onSessionExpired = () => {
      clearSession();
      navigate("/login");
    };

    // 이벤트를 구독해서 로그인 상태를 자동으로 관리
    authEvents.addEventListener("tokenRefreshed", onTokenRefreshed);
    authEvents.addEventListener("sessionExpired", onSessionExpired);

    return () => {
      authEvents.removeEventListener("tokenRefreshed", onTokenRefreshed);
      authEvents.removeEventListener("sessionExpired", onSessionExpired);
    };
  }, [applyAccessToken, clearSession]);

  useEffect(() => {
    return () => {
      logoutAbortRef.current?.abort();
      restoreSessionAbortRef.current?.abort();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        decodedUser,
        isAuthLoading,
        handleLoginSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

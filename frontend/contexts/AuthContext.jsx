import React, { useState, useMemo, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import AccountService from "../services/account.service";

const AuthContext = React.createContext({
  accessToken: null,
  decodedUser: null,
  isAuthLoading: true,
  applyAuthTokens: () => {},
  setAccessToken: () => {},
});

export function AuthContextProvider({ children }) {
  const publicRoutes = new Set(["/login", "/signup"]);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [decodedUser, setDecodedUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        setDecodedUser(decoded);
        console.log("✅decodedUser", decodedUser); // payload 정보 출력

        if (decoded.role === "admin") {
          navigate("/admin/dashboard");
        }
      } catch {
        setDecodedUser(null);
      }
    }
  }, [accessToken]);

  // 로그인 후 어떻게 UI를 보여줄지 정해야 함
  const applyAuthTokens = useCallback(async (tokenPair) => {
    Cookies.set("✅refreshToken", tokenPair.refreshToken, { expires: 14 });
    setAccessToken(tokenPair.accessToken);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const accountService = new AccountService(abortController, {});

    // 쿠키에 저장된 refreshToken을 이용해 새로운 accessToken을 발급함 (자동 로그인)
    const restoreAccessToken = async () => {
      try {
        const refreshToken = Cookies.get("refreshToken");

        if (!refreshToken) {
          setIsAuthLoading(false);
          navigate("/login");
        } else {
          const tokenPair = await accountService.getTokenPair(refreshToken);
          setAccessToken(tokenPair.accessToken);
        }
      } catch (err) {
        console.log(
          "User not logged in or refreshToken is invalid",
          err.message
        );
        if (!abortController.signal.aborted) {
          // 요청이 중단된 것이 아니고,
          // 리프레시 토큰이 만료된 상태 (401= Unauthorized) & 로긴 페이지가 아니라면
          if (err.status === 401 && window.location.pathname !== "/login") {
            // 앱 전체 경로의 쿠키를 삭제
            Cookies.remove("refreshToken", { path: "/" });
            navigate("/login");
          } // 보안상 유효하지 않은 토큰을 브라우저에 남기면 안됨
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    // 로그인 상태여야 볼 수 있는 페이지인데 토큰이 없다면
    if (!accessToken && !publicRoutes.includes(location.pathname)) {
      restoreAccessToken(); // 자동 로그인 로직 수행
    } else {
      setIsAuthLoading(false);
    } // 공개 페이지이거나 액세스 토큰이 있는 상태이므로, 로딩 상태 종료

    return () => {
      abortController.abort();
    };
  }, [location.pathname]); // 페이지 이동 시 토큰 검증이 필요할 수 있음

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        decodedUser,
        isAuthLoading,
        applyAuthTokens,
        setAccessToken,
        setDecodedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

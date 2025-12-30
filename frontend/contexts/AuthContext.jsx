import React, { useState, useCallback, useEffect } from "react";
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
  setDecodedUser: () => {},
});

export function AuthContextProvider({ children }) {
  const publicRoutes = new Set(["/", "/login", "/signup"]);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [decodedUser, setDecodedUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 후 어떻게 UI를 보여줄지 정해야 함
  const applyAuthTokens = useCallback(async (user, tokenPair) => {
    try {
      Cookies.set("refreshToken", tokenPair.refreshToken, { expires: 14 });
      Cookies.set("accessToken", tokenPair.accessToken, { expires: 7 });
      setAccessToken(tokenPair.accessToken);

      const decoded = jwtDecode(tokenPair.accessToken);
      const fullUser = { ...decoded, ...user };
      setDecodedUser(fullUser);

      if (fullUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      console.error("applyAuthTokens error:", err.message);
      setDecodedUser(null);
    }
  }, []);

  const restoreAccessToken = useCallback(async () => {
    const abortController = new AbortController();
    const accountService = new AccountService(abortController, {});

    try {
      const refreshToken = Cookies.get("refreshToken");

      if (!refreshToken) {
        setIsAuthLoading(false);
        navigate("/login");
      } else {
        const { tokenPair } =
          await accountService.regenerateTokenPair(refreshToken);
        setAccessToken(tokenPair.accessToken);
      }
    } catch (err) {
      console.log("User not logged in or refreshToken is invalid", err.message);
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
  }, [navigate]);

  // 새로고침 시
  useEffect(() => {
    const abortController = new AbortController();
    const accountService = new AccountService(abortController, {});

    const restoreUser = async () => {
      // 로그인 시 accessToken을 쿠키에 저장했으므로 새로고침을 해도 읽어낼 수 있음.
      const storedAccess = Cookies.get("accessToken");

      if (!storedAccess) {
        setIsAuthLoading(false);
        return;
      } // 로그인을 하지 않은 상태이므로, 함수 종료함.

      try {
        const decoded = jwtDecode(storedAccess); // 토큰 안의 사용자 정보 꺼냄.

        // 토큰 만료 여부 검증
        if (Date.now() >= decoded.exp * 1000) {
          console.warn("Access token expired, restoring with refresh token...");
          await restoreAccessToken();
          setIsAuthLoading(false);
          return;
        }
        setAccessToken(storedAccess);
        // accessToken 유효하면 서버에서 user 정보 받아오기
        const { user } = await accountService.getUserInfo(decoded.id);
        const fullUser = { ...decoded, ...user };
        setDecodedUser(fullUser);
      } catch (err) {
        console.error("Failed to restore user info:", err);
        if (err.response?.status === 500) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          navigate("/login");
        }
        setDecodedUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreUser();
  }, []);

  useEffect(() => {
    // 로그인 상태여야 볼 수 있는 페이지인데 토큰이 없다면
    if (!accessToken && !publicRoutes.has(location.pathname)) {
      restoreAccessToken(); // 자동 로그인 로직 수행
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

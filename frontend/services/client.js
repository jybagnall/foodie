import axios from "axios";
import { emitTokenRefreshed, emitSessionExpired } from "../utils/authEvents";

// Axios는 “HTTP 요청 도구”
// Client는 프론트엔드의 모든 API 요청을 통제 &
// 모든 API 요청마다 최신 accessToken을 자동으로 헤더에 삽입
// 왜? 백엔드는 클라이언트가 누구인지 알아야 함
//🤔 "로그인한 유저 A가 보냈구만"(인증 정보를 담은 헤더가 알랴쥼)

// 🔑 Axios 요청은 여기서 3단계로 완성돼.
// 1. axios 인스턴스 기본 설정
// 2. 요청 함수에서 넘긴 config (url, method, headers, data)
// 3. interceptor에서 최종 수정

//   headers: {
//     "Content-Type": "multipart/form-data",
//     "Authorization": "Bearer accessToken"
//   }

// 무조건 로그아웃 필요 상황이라는 refresh token 전용 에러
export class RefreshTokenExpiredError extends Error {
  constructor() {
    super("Refresh token expired");
    this.name = "RefreshTokenExpiredError";
  }
}

class Client {
  constructor(signal, getAccessToken) {
    this.getAccessToken = getAccessToken;
    this.refreshedToken = null;
    this.axios = axios.create({
      ...(signal && { signal }),
      headers: {
        "Content-Type": "application/json", // 기본 헤더 선언
      },
    }); // 요청마다 독립된 Axios 객체를 생성함

    // 모든 API 요청에 자동으로 Authorization 헤더를 붙여라.
    this.axios.interceptors.request.use((config) => {
      if (!config.skipAuth && this.getAccessToken) {
        const token = this.refreshedToken ?? this.getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // 원래 브라우저는 서버에 요청 보낼 때 쿠키를 안 보냄.
  // refreshToken이 JS에서는 접근이 불가하므로 브라우저가 쿠키를 서버에 보냄.
  // 📌“쿠키를 포함해서 refresh token 재발급 요청을 보내자”
  async refreshAccessToken() {
    try {
      const res = await this.axios.post(
        "/api/accounts/refresh-access-token",
        {}, // body (보낼 데이터, refresh token은 쿠키에 있음)
        { withCredentials: true, skipAuth: true }, // 브라우저에게 '쿠키도 보내!' 말함 →
      ); // 서버는 req.cookies.refreshToken으로 읽음
      // accessToken이 이미 만료된 상태라서 axios.create 인스턴스 안 씀

      const { accessToken } = res.data;
      return accessToken; // Client는 토큰을 저장 안함, 저장 책임은 AuthContext
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        throw new RefreshTokenExpiredError();
      } // refreshToken 문제를 명확히 밝혀서 AuthContext로 넘김.
      throw err; // 네트워크/서버 오류
    }
  }

  async request(method, endpoint, payload, options = {}) {
    const res = await this.makeRequest(() =>
      this.axios[method](endpoint, payload, { ...options }),
    );
    return res.data;
  }

  // makeRequest → 401 → get new token → retry calling API
  async makeRequest(requestFn, isRetry = false) {
    try {
      const res = await requestFn();
      return res;
    } catch (err) {
      const status = err?.response?.status;
      const shouldRefresh = status === 401 || status === 403; // 인증 실패함

      if (!isRetry && shouldRefresh) {
        try {
          const newToken = await this.refreshAccessToken();
          this.refreshedToken = newToken;
          emitTokenRefreshed(newToken);
          return await this.makeRequest(requestFn, true);
        } catch (refreshErr) {
          console.error("Refresh failed", refreshErr.message);
          emitSessionExpired();
          throw refreshErr;
        }
      }
      throw err;
    }
  }

  // public API
  async rawGet(endpoint, options = {}) {
    const res = await this.axios.get(endpoint, { ...options, skipAuth: true });
    return res.data;
  }

  // 인증 상태와 상관없는 요청(로그아웃, accessToken not needed)
  async rawPost(endpoint, payload = {}, options = {}) {
    const res = await this.axios.post(endpoint, payload, {
      ...options,
      skipAuth: true,
    });
    return res.data;
  }

  async get(endpoint) {
    return this.request("get", endpoint);
  }

  // ❗axios.post(url, body, config)
  async post(endpoint, payload, options = {}) {
    return this.request("post", endpoint, payload, options);
  }

  // ❗axios.patch(url, body, config)
  async patch(endpoint, payload) {
    return this.request("patch", endpoint, payload);
  }

  // ❗Axios의 DELETE에는 body 자리가 없음. axios.delete(url, config)
  // body를 보내려면 config.data로!
  async delete(endpoint, payload) {
    const config = payload ? { data: payload } : undefined;
    const res = await this.makeRequest(
      async () => await this.axios.delete(endpoint, config),
    );
    return res.data;
  }
}

export default Client;

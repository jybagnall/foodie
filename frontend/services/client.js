import axios from "axios";

// Axios는 “HTTP 요청 도구”
// Client는 “Axios를 관리하는 관리자”
// Axios가 매 요청마다 최신 accessToken을 자동으로 헤더에 삽입
//🤔 백엔드는 클라이언트가 누구인지 알아야 함 (인증 정보를 담은 헤더를 보냄)
//🤔 "로그인한 유저 A가 보냈구만"
export class RefreshTokenExpiredError extends Error {
  constructor() {
    super("Refresh token expired");
    this.name = "RefreshTokenExpiredError";
  }
}

class Client {
  constructor(abortController, authContext) {
    this.abortController = abortController;
    this.authContext = authContext;
    this.axios = axios.create({
      signal: this.abortController.signal,
    }); // 나만의 설정이 들어간 Axios 객체를 생성함

    this.axios.interceptors.request.use((config) => {
      const token = this.authContext.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    }); // accessToken 동적 주입 🤔🤔🤔
  }

  async refreshAccessToken() {
    try {
      const res = await axios.post(
        "/api/accounts/refresh-access-token",
        {},
        { withCredentials: true },
      ); // 🤔

      const { accessToken } = res.data;
      return accessToken;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        throw new RefreshTokenExpiredError();
      } // refreshToken 문제를 명확히 밝혀서 AuthContext로 넘김.
      throw err; // 네트워크/서버 오류
    }
  }

  async get(endpoint) {
    const response = await this.makeRequest(
      async () => await this.axios.get(endpoint),
    );
    return response.data;
  }

  async post(endpoint, payload) {
    const headers = {};

    if (payload instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await this.makeRequest(
      async () => await this.axios.post(endpoint, payload, { headers }),
    );
    return response.data;
  }

  async patch(endpoint, payload) {
    const headers = {};

    if (payload instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await this.makeRequest(
      async () => await this.axios.patch(endpoint, payload, { headers }),
    );
    return response.data;
  }

  async delete(endpoint, payload) {
    const config = payload ? { data: payload } : undefined;
    const response = await this.makeRequest(
      async () => await this.axios.delete(endpoint, config),
    );
    return response.data;
  }

  // makeRequest → 401 → refresh → retry
  async makeRequest(requestFn, isRetry = false) {
    try {
      const res = await requestFn();
      return res;
    } catch (err) {
      const status = err.response?.status;
      const shouldRefresh = status === 401 || status === 403;

      if (!isRetry && shouldRefresh) {
        try {
          await this.refreshAccessToken();
          // refreshAccessToken updates accessToken in AuthContext
          return await this.makeRequest(requestFn, true);
        } catch (refreshErr) {
          console.error("Refresh failed", refreshErr.message);
          throw refreshErr;
        }
      }
      throw err;
    }
  }
}

export default Client;

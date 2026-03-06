import axios from "axios";

// Axios는 “HTTP 요청 도구”
// Client는 프론트엔드의 모든 API 요청을 통제 &
// 모든 API 요청마다 최신 accessToken을 자동으로 헤더에 삽입
// 왜? 백엔드는 클라이언트가 누구인지 알아야 함
//🤔 "로그인한 유저 A가 보냈구만"(인증 정보를 담은 헤더가 알랴쥼)

// 🔑 Axios 요청은 여기서 3단계로 완성돼.
// 1. axios 인스턴스 기본 설정
// 2. 요청 함수에서 넘긴 config (url, method, headers, data)
// 3. interceptor에서 최종 수정

// ❌ 개선점: 항상 같은 설정을 항상 새로 정의하고 있음,
// 즉 변하지 않는 규칙을 매 요청마다 재선언 중❌

// 무조건 로그아웃 필요 상황이라는 refresh token 전용 에러
export class RefreshTokenExpiredError extends Error {
  constructor() {
    super("Refresh token expired");
    this.name = "RefreshTokenExpiredError";
  }
}

class Client {
  constructor(abortController, getAccessToken) {
    this.abortController = abortController;
    this.getAccessToken = getAccessToken;
    this.axios = axios.create({
      signal: this.abortController.signal,
    }); // 요청마다 독립된 Axios 객체를 생성함

    // 모든 요청 전에 실행.
    // Axios: 택배 기사,  interceptor: 택배 송장(Authorization 헤더) 검사원
    // config: Axios 요청 1건에 대한 정보 객체(url, method, headers, data 있음)
    this.axios.interceptors.request.use((config) => {
      if (!config.skipAuth && this.getAccessToken) {
        const token = this.getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }); // 모든 API 요청에 자동으로 Authorization 헤더를 붙여라.
  } // 요청받은 백엔드: "로그인한 유저 A가 보냈구만"

  // 원래 브라우저는 서버에 요청 보낼 때 쿠키를 안 보냄.
  // refreshToken이 JS에서는 접근이 불가하므로 브라우저가 쿠키를 서버에 보냄.
  async refreshAccessToken() {
    try {
      // refresh token으로 access token을 재발급하는 API
      // 📌“쿠키를 포함해서 refresh token 요청을 보내자”
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

  // public API
  async rawGet(endpoint, options = {}) {
    const res = await this.axios.get(endpoint, options);
    return res.data;
  }

  // 인증 상태와 상관없는 요청(로그아웃, accessToken not needed)
  async rawPost(endpoint, payload = {}, options = {}) {
    const res = await this.axios.post(endpoint, payload, options);
    return res.data;
  }

  async get(endpoint) {
    const response = await this.makeRequest(
      async () => await this.axios.get(endpoint),
    );
    return response.data;
  }

  // ❗axios.post(url, body, config)
  async post(endpoint, payload, options = {}) {
    const headers = options.headers ?? {};

    if (payload instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await this.makeRequest(
      async () =>
        await this.axios.post(endpoint, payload, { ...options, headers }),
    );
    return response.data;
  }
  // ❗interceptor가 도착해서 Authorization 헤더를 추가함.
  //   {
  //   headers: {
  //     "Content-Type": "multipart/form-data",
  //     "Authorization": "Bearer accessToken"
  //   }
  // }

  // ❗axios.patch(url, body, config)
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

  // ❗Axios의 DELETE에는 body 자리가 없음. axios.delete(url, config)
  // body를 보내려면 config.data로!
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
      const status = err?.response?.status;
      const shouldRefresh = status === 401 || status === 403; // 인증 실패함

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

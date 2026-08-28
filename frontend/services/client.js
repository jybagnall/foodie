import axios from "axios";
import { emitTokenRefreshed, emitSessionExpired } from "../utils/authEvents";

// 무조건 로그아웃 필요 상황이라는 refresh token 전용 에러
export class RefreshTokenExpiredError extends Error {
  constructor() {
    super("Refresh token expired");
    this.name = "RefreshTokenExpiredError";
  }
}

export class NoRefreshTokenError extends Error {
  constructor() {
    super("No refresh token present");
    this.name = "NoRefreshTokenError";
  }
}

// 현재 진행 중인 Refresh 요청을 저장하는 변수
// 모든 Client 인스턴스가 공유함
let onGoingRenewPromise = null;

// 원래 브라우저는 서버에 요청 보낼 때 쿠키를 안 보냄.
// refreshToken이 JS에서는 접근이 불가하므로 브라우저가 쿠키를 서버에 보냄.
// 📌“쿠키를 포함해서 refresh token 재발급 요청을 보내자”

// HttpOnly Cookie에 저장된 Refresh Token을 서버로 보내서
// 새로운 Access Token을 발급받음
async function performRefresh() {
  try {
    const res = await axios.post(
      "/api/accounts/refresh-access-token",
      {}, // body (보낼 데이터, 쿠키는 HttpOnly Cookie에 있음)
      { withCredentials: true }, // 브라우저에게 '쿠키도 보내!' 말함 →
    );
    // 서버는 req.cookies.refreshToken으로 읽음
    // 갱신 요청에는 Access Token이 필요 없으므로
    // 인증 interceptor가 설정된 this.axios 대신 기본 axios를 사용

    const { accessToken } = res.data; // 서버가 새로 발급해줌
    emitTokenRefreshed(accessToken); // 앱 전체에 딱 한 번만 알림

    return accessToken;
  } catch (err) {
    const status = err?.response?.status;

    // Refresh Token 자체가 만료됐거나 폐기됐을 가능성
    if (status === 401 || status === 403) {
      emitSessionExpired(); // 앱 전체에 세션이 만료됐음을 알림
      throw new RefreshTokenExpiredError();
    } // refreshToken 문제를 명확히 밝혀서 AuthContext로 넘김.

    // 로그인한 적 없거나 이미 로그아웃된 정상 상태 — 에러 아님
    if (status === 400) {
      throw new NoRefreshTokenError();
    }

    throw err; // 네트워크나 서버 오류
  }
}

// 여러 Client가 Refresh Token을 요청할 때 하나의 Refresh 요청을 공유하게 함
export function getRenewedAccessTokenOnce() {
  // Refresh 요청이 없다면 실행
  if (!onGoingRenewPromise) {
    onGoingRenewPromise = performRefresh().finally(() => {
      onGoingRenewPromise = null;
    }); // 성공이든 실패든 다음을 위해 null로 저장
  }

  return onGoingRenewPromise;
}

// 요청마다 독립된 Axios 객체를 생성함
class Client {
  constructor(signal, getAccessToken) {
    this.getAccessToken = getAccessToken;
    this.axios = axios.create({
      ...(signal && { signal }),
    });

    // 인증이 필요한 모든 API 요청에 자동으로 Authorization 헤더를 붙여라.
    this.axios.interceptors.request.use((config) => {
      // 인증이 필요한 요청인가
      if (
        !config.skipAuth &&
        !config.headers?.Authorization &&
        this.getAccessToken
      ) {
        const token = this.getAccessToken();

        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // 공통 요청 함수
  async request(method, endpoint, payload, options = {}) {
    const buildConfig = (accessToken) =>
      accessToken
        ? {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : options;

    const requestFn = (accessToken) =>
      method === "delete"
        ? () =>
            this.axios.delete(endpoint, {
              ...buildConfig(accessToken),
              ...(payload && { data: payload }),
            })
        : () => this.axios[method](endpoint, payload, buildConfig(accessToken));

    const res = await this.makeRequest(requestFn);
    return res.data; // API의 데이터만 반환
  }

  // makeRequest → 401 → get new token → retry calling API
  async makeRequest(requestFn, retryAccessToken = null, isRetry = false) {
    try {
      const res = await requestFn(retryAccessToken);
      return res;
    } catch (err) {
      const status = err?.response?.status;
      const shouldRefresh = status === 401 || status === 403; // 인증 실패함

      if (!isRetry && shouldRefresh) {
        try {
          const newAccessToken = await getRenewedAccessTokenOnce();
          return await this.makeRequest(requestFn, newAccessToken, true);
        } catch (refreshErr) {
          console.error("Refresh failed", refreshErr.message);
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

  // 인증 상태와 상관없는 요청(로그인, 로그아웃, signup)
  // 토큰이 필요없는 요청
  async rawPost(endpoint, payload = {}, options = {}) {
    const res = await this.axios.post(endpoint, payload, {
      ...options,
      skipAuth: true,
    });
    return res.data;
  }

  async get(endpoint, options = {}) {
    return this.request("get", endpoint, undefined, options);
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
  async delete(endpoint, payload, options = {}) {
    return this.request("delete", endpoint, payload, options);
  }
}

export default Client;

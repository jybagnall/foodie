import axios from "axios";
import { emitTokenRefreshed, emitSessionExpired } from "../utils/authEvents";

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

let ongoingRenewPromise = null;

async function performRefresh() {
  try {
    const res = await axios.post(
      "/api/accounts/refresh-access-token",
      {}, // body (보낼 데이터, 쿠키는 HttpOnly Cookie에 있음)
      { withCredentials: true }, // 브라우저에게 '쿠키도 보내!' 말함 →
    );

    const { accessToken } = res.data; // 서버가 새로 발급해줌
    emitTokenRefreshed(accessToken); // 앱 전체에 딱 한 번만 알림

    return accessToken;
  } catch (err) {
    const status = err?.response?.status;

    if (status === 401 || status === 403) {
      emitSessionExpired(); // 앱 전체에 세션이 만료됐음을 알림
      throw new RefreshTokenExpiredError();
    }

    if (status === 400) {
      throw new NoRefreshTokenError();
    }

    throw err; // 네트워크나 서버 오류
  }
}

export function getRenewedAccessTokenOnce() {
  if (!ongoingRenewPromise) {
    ongoingRenewPromise = performRefresh().finally(() => {
      ongoingRenewPromise = null;
    });
  }

  return ongoingRenewPromise;
}

class Client {
  constructor(signal, getAccessToken) {
    this.getAccessToken = getAccessToken;
    this.axios = axios.create({
      ...(signal && { signal }),
    });

    this.axios.interceptors.request.use((config) => {
      if (
        !config.skipAuth &&
        !config.headers.Authorization &&
        this.getAccessToken
      ) {
        const token = this.getAccessToken();

        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async request(method, endpoint, payload, options = {}) {
    const config = {
      ...options,
      headers: {
        ...options.headers,
      },
    };

    const requestFn = () =>
      method === "delete"
        ? this.axios.delete(endpoint, {
            ...config,
            ...(payload && { data: payload }),
          })
        : this.axios[method](endpoint, payload, config);

    const res = await this.makeRequest(requestFn, config);

    return res.data; // API의 데이터만 반환
  }

  // makeRequest → 401 → get new token → retry calling API
  async makeRequest(requestFn, config, isRetry = false) {
    try {
      const res = await requestFn();
      return res;
    } catch (err) {
      const status = err?.response?.status;
      const shouldRefresh = status === 401 || status === 403; // 인증 실패함

      if (!isRetry && shouldRefresh) {
        try {
          const newAccessToken = await getRenewedAccessTokenOnce();
          config.headers.Authorization = `Bearer ${newAccessToken}`;

          return await this.makeRequest(requestFn, config, true);
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

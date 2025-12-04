import axios from "axios";
import Cookies from "js-cookie";

// Axios는 “HTTP 요청 도구”
//Client는 “Axios를 관리하는 관리자”
// 모든 요청에 Authorization 헤더를 자동으로 넣어주고,
// 401(Unauthorized) 에러가 나면 refresh token으로 자동 갱신하고 재시도

class Client {
  constructor(abortController, authContext) {
    this.abortController = abortController;
    this.authContext = authContext;
    this.axios = axios.create({
      signal: this.abortController.signal,
      headers: {},
    }); // 나만의 설정이 들어간 Axios 객체를 생성함

    //🤔 백엔드는 클라이언트가 누구인지 알아야 함 (인증 정보를 담은 헤더를 보냄)
    //🤔 "로그인한 유저 A가 보냈구만"

    // Axios 인스턴스의 “기본 설정”들이 들어있는 객체가 (this.axios.defaults) 있음.
    // 모든 요청에 공통적으로 적용되는 헤더들의 모음 (.headers.common = 객체) 안에
    // HTTP 요청의 Authorization 헤더를 지정 (["Authorization"])
    if (authContext.accessToken) {
      this.axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${authContext.accessToken}`;
    }
  }

  async refreshAccessToken() {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) throw new Error("No refresh token found");

    const res = await axios.post("/api/accounts/refresh-tokens", {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefresh } = res.data;

    Cookies.set("refreshToken", newRefresh, {
      expires: 14,
    });

    this.authContext.setAccessToken(accessToken);
    this.axios.defaults.headers.Authorization = `Bearer ${accessToken}`;

    return accessToken;
  }

  async get(endpoint) {
    const response = await this.makeRequest(
      async () => await this.axios.get(endpoint)
    );
    return response.data;
  }

  async post(endpoint, payload) {
    const headers = {};

    if (payload instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await this.makeRequest(
      async () => await this.axios.post(endpoint, payload, { headers })
    );
    return response.data;
  }

  async patch(endpoint, payload) {
    const headers = {};

    if (payload instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }

    const response = await this.makeRequest(
      async () => await this.axios.patch(endpoint, payload, { headers })
    );
    return response.data;
  }

  async delete(endpoint, payload) {
    const config = payload ? { data: payload } : undefined;
    const response = await this.makeRequest(
      async () => await this.axios.delete(endpoint, config)
    );
    return response.data;
  }

  async makeRequest(requestFn, isRetry = false) {
    try {
      const res = await requestFn();
      return res;
    } catch (err) {
      const isUnauthorized = err.response?.status === 401;

      if (!isRetry && isUnauthorized) {
        try {
          await this.refreshAccessToken();
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

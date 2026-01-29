import { data } from "react-router-dom";
import Client from "./client";

class AccountService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async createUserAccount(name, email, password) {
    const data = await this.client.post("/api/accounts/signup", {
      name,
      email,
      password,
    });
    return data;
  }

  async changePassword(password) {
    const data = await this.client.patch("/api/accounts/change-password", {
      password,
    });
    return data;
  }

  async deleteAccount() {
    await this.client.delete("/api/accounts/delete-account");
  }

  async editUserAccount(formData) {
    const data = await this.client.patch(
      "/api/accounts/edit-profile",
      formData,
    );
    return data;
  }

  async getUserInfo() {
    const data = await this.client.get(`/api/accounts/user`);
    return data;
  }

  async loginUser(email, password) {
    const data = await this.client.post("/api/accounts/login", {
      email,
      password,
    });
    return data;
  }

  // 브라우저에게 refresh token이 있는 쿠키를 보내라고 요청함
  // 서버는 쿠키에 담긴 refreshToken으로 누가 로그아웃하는지 이미 앎
  // body에 userId를 보내면 오히려 보안적으로 나쁨
  async logoutUser() {
    await this.client.post(
      `/api/accounts/logout, {}, { withCredentials: true }`,
    );
  }

  async regenerateAccessToken() {
    const data = await this.client.post("/api/accounts/refresh-access-token");
    return data;
  }

  async resetPasswordRequest(email) {
    const data = await this.client.post("/api/accounts/reset-password", {
      email,
    });
    return data;
  }

  async updatePassword(resetToken, password) {
    const data = await this.client.post("/api/accounts/update-password", {
      resetToken,
      password,
    });
    return data;
  }
}

export default AccountService;

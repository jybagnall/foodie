import Client from "./client";

class AccountService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async createUserAccount(name, email, password) {
    const data = await this.client.rawPost("/api/accounts/signup", {
      name,
      email,
      password,
    });
    return data;
  }

  async deleteAccount() {
    await this.client.delete("/api/accounts/delete-account");
  }

  async getMyProfile() {
    const data = await this.client.get(`/api/accounts/my-profile`);
    return data;
  }

  async getUserInfo() {
    const data = await this.client.get(`/api/accounts/user`);
    return data;
  }

  async loginUser(email, password) {
    const data = await this.client.rawPost("/api/accounts/login", {
      email,
      password,
    });
    return data;
  }

  // 브라우저에게 refresh token이 있는 쿠키를 보내라고 요청함
  // 서버는 쿠키에 담긴 refreshToken으로 누가 로그아웃하는지 이미 앎
  // body에 userId를 보내면 오히려 보안적으로 나쁨
  async logoutUser() {
    await this.client.rawPost(
      "/api/accounts/logout",
      {},
      { withCredentials: true },
    );
  }

  async regenerateAccessToken() {
    const data = await this.client.post("/api/accounts/refresh-access-token");
    return data;
  }

  async resetPasswordRequest(resetToken, password) {
    const data = await this.client.patch("/api/accounts/reset-password", {
      resetToken,
      password,
    });
    return data;
  }

  async updateUsername(name) {
    const data = await this.client.patch("/api/accounts/update-name", { name });
    return data;
  }

  async updatePassword(currentPassword, password) {
    const data = await this.client.patch("/api/accounts/update-password", {
      currentPassword,
      password,
    });
    return data;
  }
}

export default AccountService;

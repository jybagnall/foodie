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

  async getUserInfo(id) {
    const data = await this.client.get(`/api/accounts/user/${id}`);
    return data;
  }

  async loginUser(email, password) {
    const data = await this.client.post("/api/accounts/login", {
      email,
      password,
    });
    return data;
  }

  async regenerateTokenPair(refreshToken) {
    const data = await this.client.post("/api/accounts/refresh-tokens", {
      refreshToken,
    });
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

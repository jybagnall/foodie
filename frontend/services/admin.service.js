import Client from "./client";

class AdminService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async createAdminAccount(name, email, password, inviteToken) {
    const data = await this.client.post("/api/admins/admin-signup", {
      name,
      email,
      password,
      inviteToken,
    });
    return data;
  }

  async inviteNewAdmin(email) {
    const data = await this.client.post("/api/admins/invite", {
      email,
    });
    return data;
  }
}

export default AdminService;

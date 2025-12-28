import Client from "./client";

class AdminService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
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

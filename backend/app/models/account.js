import { hashPassword } from "../utils/auth.js";

class Account {
  constructor(name, email, passwordHash) {
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  static async createAccount(payload) {
    return new Account(
      payload.name?.trim(),
      payload.email?.trim(),
      payload.password ? await hashPassword(payload.password) : null,
    );
  }
}

export default Account;

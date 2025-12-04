import { hashPassword } from "../utils/auth.js";

class Account {
  constructor(name, email, passwordHash) {
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  static createAccount(payload) {
    return new Account(
      payload.name?.trim(),
      payload.email?.trim(),
      payload.password ? hashPassword(payload.password) : null
    );
  }
}

export default Account;

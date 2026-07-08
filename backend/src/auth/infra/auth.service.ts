import { Injectable } from '@nestjs/common';
import { LoginUser } from '../app/LoginUser';
import { RefreshAccessToken } from '../app/RefreshAccessToken';
import { Logout } from '../app/LogoutUser';
import { LoginFirebaseUser } from '../app/LoginFirebaseUser';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUser: LoginUser,
    private readonly refreshAccessToken: RefreshAccessToken,
    private readonly Logout: Logout,
    private readonly LoginFirebaseUser: LoginFirebaseUser,
  ) { }

  async login(username: string, pass: string) {
    return await this.loginUser.run({ username, password: pass });
  }

  async refreshToken(token: string) {
    return await this.refreshAccessToken.run(token);
  }

  async logout() {
    return await this.Logout.run();
  }

  async loginFirebaseUser({
    email,
    name,
    firebaseUid
  }: {
    email: string,
    name: string,
    firebaseUid: string,
  }) {
    return await this.LoginFirebaseUser.run({ email, name, firebaseUid });
  }
}

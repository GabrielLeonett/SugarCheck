import { Injectable } from '@nestjs/common';
import { LoginUser } from '../app/LoginUser';
import { RefreshAccessToken } from '../app/RefreshAccessToken';
import { Logout } from '../app/LogoutUser';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUser: LoginUser,
    private readonly refreshAccessToken: RefreshAccessToken,
    private readonly Logout: Logout,
  ) {}

  async login(email: string, pass: string) {
    return await this.loginUser.run({ email, password: pass });
  }

  async refreshToken(token: string) {
    return await this.refreshAccessToken.run(token);
  }

  async logout() {
    return await this.Logout.run();
  }
}

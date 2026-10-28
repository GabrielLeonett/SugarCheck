import { Injectable } from '@nestjs/common';
import { LoginUser } from '../app/LoginUser';
import { RefreshAccessToken } from '../app/RefreshAccessToken';
import { Logout } from '../app/LogoutUser';
import { LoginFirebaseUser } from '../app/LoginFirebaseUser';
import { ForgotPassword } from '../app/ForgotPassword';
import { ResetPassword } from '../app/ResetPassword';
import { ChangePassword } from '../app/ChangePassword';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUser: LoginUser,
    private readonly refreshAccessToken: RefreshAccessToken,
    private readonly Logout: Logout,
    private readonly LoginFirebaseUser: LoginFirebaseUser,
    private readonly forgotPasswordUseCase: ForgotPassword,
    private readonly resetPasswordUseCase: ResetPassword,
    private readonly changePasswordUseCase: ChangePassword,
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

  async forgotPassword(email: string, lang?: string) {
    return await this.forgotPasswordUseCase.run({ email, lang });
  }

  async resetPassword(email: string, code: string, password: string) {
    return await this.resetPasswordUseCase.run({ email, code, password });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return await this.changePasswordUseCase.run({ userId, currentPassword, newPassword });
  }
}

export interface SendEmailInterface {
  sendResetPasswordEmail(to: string, code: string, name: string, lang?: string): Promise<void>;
}

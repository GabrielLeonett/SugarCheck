import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import type { GetOneByEmailInterface } from './ports/GetOneByEmailInterface';
import type { SendEmailInterface } from './ports/SendEmailInterface';
import type { ResetCodeStoreInterface } from './ports/ResetCodeStoreInterface';

@Injectable()
export class ForgotPassword {
  constructor(
    @Inject('GetOneByEmailUser')
    private readonly getOneByEmailUser: GetOneByEmailInterface,
    @Inject('NodemailerService')
    private readonly emailService: SendEmailInterface,
    @Inject('ResetCodeStore')
    private readonly resetCodeStore: ResetCodeStoreInterface,
  ) {}

  async run(
    data: { email: string; lang?: string },
  ): Promise<Result<{ message: string }, ErrorAbstract>> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const userResult = await this.getOneByEmailUser.run({ email: data.email });

    const name = userResult.isValid
      ? (userResult.getValue().toPlain() as any).name || 'usuario'
      : 'usuario';

    await this.resetCodeStore.store(data.email, code);

    await this.emailService.sendResetPasswordEmail(data.email, code, name, data.lang);

    return Result.ok({ message: 'Si el correo existe, recibir\u00e1s instrucciones' });
  }
}

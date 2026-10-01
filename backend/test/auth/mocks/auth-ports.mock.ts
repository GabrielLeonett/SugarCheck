import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { InvalidCredentialsError } from '../../../src/auth/core/errors/InvalidCredentialsError';
import { UserInterface } from '../../../src/auth/app/ports/UserInterface';
import { GetOneByEmailInterface } from '../../../src/auth/app/ports/GetOneByEmailInterface';
import { GetOneByUsernameInterface } from '../../../src/auth/app/ports/GetOneByUsernameInterface';
import { GetOneByIdInterface } from '../../../src/auth/app/ports/GetOneByIdInterface';
import { SaveUserInterface } from '../../../src/auth/app/ports/SaveUserInterface';
import { UpdatePasswordInterface } from '../../../src/auth/app/ports/UpdatePasswordInterface';
import { SendEmailInterface } from '../../../src/auth/app/ports/SendEmailInterface';
import { ResetCodeStoreInterface } from '../../../src/auth/app/ports/ResetCodeStoreInterface';

export function makeFakeUser(
  overrides: Partial<UserInterface['toPlain']> = {},
): UserInterface {
  const plain = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Gabriel Test',
    username: 'gabrieltest',
    email: 'gabriel@test.com',
    roles: ['guerrero'],
    sexo: 'masculino',
    fechaNacimiento: new Date('2015-05-10'),
    password: '$2a$10$hashedpasswordvalue',
    createdAt: new Date(),
    ...overrides,
  };
  return { toPlain: () => plain } as unknown as UserInterface;
}

export class StubGetOneByUsernameUser implements GetOneByUsernameInterface {
  public response: Result<UserInterface, ErrorAbstract> | null = null;

  async run(data: {
    username: string;
  }): Promise<Result<UserInterface, ErrorAbstract>> {
    if (this.response) return this.response;
    return Result.fail(new InvalidCredentialsError('Credenciales Invalidas'));
  }
}

export class StubGetOneByEmailUser implements GetOneByEmailInterface {
  public response: Result<UserInterface, ErrorAbstract> | null = null;

  async run(data: {
    email: string;
  }): Promise<Result<UserInterface, ErrorAbstract>> {
    if (this.response) return this.response;
    return Result.fail(new InvalidCredentialsError('Credenciales Invalidas'));
  }
}

export class StubGetOneByIdUser implements GetOneByIdInterface {
  public response: Result<UserInterface, ErrorAbstract> | null = null;

  async run(data: {
    id: string;
  }): Promise<Result<UserInterface, ErrorAbstract>> {
    if (this.response) return this.response;
    return Result.fail(new InvalidCredentialsError('Usuario no encontrado'));
  }
}

export class StubSaveUser implements SaveUserInterface {
  public calls: any[] = [];

  async run(data: {
    name: string;
    username: string;
    email?: string;
    roles: string[];
    sexo: string;
    fechaNacimiento: Date;
    password: string;
  }): Promise<Result<UserInterface, ErrorAbstract>> {
    this.calls.push(data);
    return Result.ok(
      makeFakeUser({ username: data.username, email: data.email }),
    );
  }
}

export class StubUpdatePassword implements UpdatePasswordInterface {
  public calls: { id: string; hashedPassword: string }[] = [];

  async run(
    id: string,
    hashedPassword: string,
  ): Promise<Result<void, ErrorAbstract>> {
    this.calls.push({ id, hashedPassword });
    return Result.ok(undefined);
  }
}

export class StubEmailService implements SendEmailInterface {
  public calls: { to: string; code: string; name: string; lang?: string }[] =
    [];

  async sendResetPasswordEmail(
    to: string,
    code: string,
    name: string,
    lang?: string,
  ): Promise<void> {
    this.calls.push({ to, code, name, lang });
  }
}

export class InMemoryResetCodeStore implements ResetCodeStoreInterface {
  public entries = new Map<string, string>();

  async store(email: string, code: string): Promise<void> {
    this.entries.set(email.toLowerCase(), code);
  }

  async verify(email: string, code: string): Promise<boolean> {
    return this.entries.get(email.toLowerCase()) === code;
  }

  async delete(email: string): Promise<void> {
    this.entries.delete(email.toLowerCase());
  }
}

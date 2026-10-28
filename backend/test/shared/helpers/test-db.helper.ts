import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';

export function loadTestEnv(): void {
  dotenv.config({ path: '.env.test' });
}

export const TEST_PASSWORD = 'Password123';

export interface TestUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export async function createTestUser(
  prisma: any,
  roles: string[] = ['guerrero'],
): Promise<TestUser> {
  const id = faker.string.uuid();
  const username = `t_${faker.string.alphanumeric(10).toLowerCase()}`;
  const user = await prisma.user.create({
    data: {
      id,
      name: 'Usuario Test',
      username,
      email: `${username}@test.com`,
      password: bcrypt.hashSync(TEST_PASSWORD, 10),
      sexo: 'masculino',
      roles,
      fechaNacimiento: new Date('2015-05-10'),
    },
  });
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  };
}

export async function deleteTestUser(
  prisma: any,
  userId: string,
): Promise<void> {
  await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
}

// Firma un JWT real con el JWT_SECRET de .env.test (el AuthGuard lo valida de verdad)
export function signAccessToken(payload: {
  sub: string;
  username: string;
  roles: string[];
}): string {
  const jwtService = new JwtService({ secret: process.env.JWT_SECRET });
  return jwtService.sign(payload, { expiresIn: '15m' });
}

export function authCookie(token: string): string {
  return `access_token=${token}`;
}

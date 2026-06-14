import { compare, hash } from 'bcrypt';
import { PasswordHasher } from '../../application/ports/password-hasher.interface';

export class BcryptHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return hash(password, 10);
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}

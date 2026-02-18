import { User } from '../User';

export interface AuthServicePort {
  generateToken(user: User): string;
  verifyToken(token: string): string;
}

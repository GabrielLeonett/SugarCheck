import { Result } from 'src/shared/result';
import { UserId } from './UserId';
import { User } from './User';
import { ErrorAbstract } from 'src/shared/error-abstract';
import { UserEmail } from './UserEmail';

export interface UserRepository {
  getAll(): Promise<Result<User[], ErrorAbstract>>;

  getOneById(id: UserId): Promise<Result<User | null, ErrorAbstract>>;

  getOneByEmail(email: UserEmail): Promise<Result<User | null, ErrorAbstract>>;

  save(user: User): Promise<Result<User, ErrorAbstract>>;

  delete(id: UserId): Promise<Result<void, ErrorAbstract>>;
}

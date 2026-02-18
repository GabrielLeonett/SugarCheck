import { UserId } from './value-objects/UserId';
import { User } from './User';
import { UserEmail } from './value-objects/UserEmail';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';

export interface UserRepository {
  getAll(): Promise<Result<User[], ErrorAbstract>>;

  getOneById(id: UserId): Promise<Result<User | null, ErrorAbstract>>;

  getOneByEmail(email: UserEmail): Promise<Result<User | null, ErrorAbstract>>;

  save(user: User): Promise<Result<User, ErrorAbstract>>;

  delete(id: UserId): Promise<Result<void, ErrorAbstract>>;
}

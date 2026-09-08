import { UserRepository } from '../core/UserRepository';
import { User } from '../core/User';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';

export class GetAllUser {
  constructor(private readonly repository: UserRepository) {}

  public async run(): Promise<Result<User[], ErrorAbstract>> {
    return await this.repository.getAll();
  }
}

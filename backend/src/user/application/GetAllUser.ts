import { Result } from 'src/shared/result';
import { UserRepository } from '../core/UserRepository';
import { User } from '../core/User';
import { ErrorAbstract } from 'src/shared/error-abstract';

export class GetAllUser {
  constructor(private readonly repository: UserRepository) {}

  public async run(): Promise<Result<User[], ErrorAbstract>> {
    return await this.repository.getAll();
  }
}

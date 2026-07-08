import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';
import type { UserInterface } from './UserInterface';

export interface GetOneByUsernameInterface {
  run(data: { username: string }): Promise<Result<UserInterface, ErrorAbstract>>;
}

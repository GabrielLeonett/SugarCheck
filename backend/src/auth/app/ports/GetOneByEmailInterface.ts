import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';
import { UserInterface } from './UserInterface';

export interface GetOneByEmailInterface {
  run(data: { email: string }): Promise<Result<UserInterface, ErrorAbstract>>;
}

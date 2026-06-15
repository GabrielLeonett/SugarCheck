import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';
import { UserInterface } from './UserInterface';


export interface GetOneByIdInterface {
  run(data: { id: string }): Promise<Result<UserInterface, ErrorAbstract>>;
}

import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export interface GetOneByEmailInterface {
  run(data: { email: string }): Promise<Result<any, ErrorAbstract>>;
}

import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export interface GetOneByIdInterface {
  run(data: { id: string }): Promise<Result<any, ErrorAbstract>>;
}

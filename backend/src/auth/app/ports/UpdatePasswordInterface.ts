import { Result } from '../../../shared/result';
import { ErrorAbstract } from '../../../shared/error-abstract';

export interface UpdatePasswordInterface {
  run(id: string, hashedPassword: string): Promise<Result<void, ErrorAbstract>>;
}

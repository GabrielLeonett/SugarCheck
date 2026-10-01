import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export interface GlucoseDataProvider {
  getContext(userId: string): Promise<Result<string, ErrorAbstract>>;
}

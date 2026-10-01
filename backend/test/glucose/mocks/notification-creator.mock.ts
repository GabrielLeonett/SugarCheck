import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';

export class StubCreateNotification {
  public calls: {
    userId: string;
    type: string;
    titleKey: string;
    messageKey: string;
    params?: Record<string, string | number>;
    link: string;
  }[] = [];

  async run(data: {
    userId: string;
    type: string;
    titleKey: string;
    messageKey: string;
    params?: Record<string, string | number>;
    link: string;
  }): Promise<Result<unknown, ErrorAbstract>> {
    this.calls.push(data);
    return Result.ok(undefined);
  }
}

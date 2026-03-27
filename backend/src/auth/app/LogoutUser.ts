import { Injectable } from '@nestjs/common';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';

@Injectable()
export class Logout {
  async run(): Promise<Result<void, ErrorAbstract>> {
    return Result.ok(undefined);
  }
}
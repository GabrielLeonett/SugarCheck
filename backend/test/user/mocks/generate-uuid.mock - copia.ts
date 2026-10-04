import { GenerateUUIDInterface } from '../../../src/shared/application/ports/generate-uuid.interface';

export class GenerateUUID implements GenerateUUIDInterface {
  run(): string {
    return crypto.randomUUID().toString();
  }
}

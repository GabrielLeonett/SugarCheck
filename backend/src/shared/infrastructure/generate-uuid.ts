import { GenerateUUIDInterface } from '../application/ports/generate-uuid.interface';

export class GenerateUUID implements GenerateUUIDInterface {
  run(): string {
    return crypto.randomUUID().toString();
  }
}

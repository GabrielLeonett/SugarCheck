import { ErrorAbstract } from './error-abstract';

export class Result<T, E extends ErrorAbstract> {
  public readonly isValid: boolean;
  private readonly value: T;
  private readonly error: E;

  private constructor(isValid: boolean, value?: T, error?: E) {
    this.isValid = isValid;
    this.value = value as T;
    this.error = error as E;
  }

  // Simplificamos la firma del método
  static ok<T, E extends ErrorAbstract>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined as any);
  }

  static fail<T, E extends ErrorAbstract>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined as any, error);
  }

  public getValue(): T {
    if (!this.isValid) {
      throw new Error(
        `Intentaste acceder al valor, pero el resultado falló: ${this.error?.message}`,
      );
    }
    return this.value;
  }

  public getError(): E {
    if (this.isValid) {
      throw new Error(
        'Intentaste acceder al error, pero el resultado es exitoso.',
      );
    }
    return this.error;
  }
}

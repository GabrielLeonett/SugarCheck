export type ErrorOrigin = 'domain' | 'infrastructure' | 'external';

export abstract class ErrorAbstract extends Error {
  public readonly name: string;
  public readonly date: Date;
  public code?: string;
  public field?: string;
  public readonly origin: ErrorOrigin;

  constructor(
    message: string,
    options?: { stack?: string; code?: string; field?: string; origin?: ErrorOrigin },
  ) {
    super(message, { cause: options?.stack });

    this.name = this.constructor.name;
    this.date = new Date();
    this.code = options?.code;
    this.field = options?.field;
    this.origin = options?.origin ?? 'domain';

    Object.setPrototypeOf(this, new.target.prototype);

    if (!options?.stack && Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  withCode(code: string, field?: string): this {
    this.code = code;
    if (field) this.field = field;
    return this;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      field: this.field,
      origin: this.origin,
      date: this.date.toISOString(),
      stack: this.stack,
      cause: this.cause,
    };
  }
}

export abstract class ErrorAbstract extends Error {
  public readonly name: string;
  public readonly date: Date;
  public readonly code?: string; // Opcional: código de error personalizado

  constructor(message: string, options?: { stack?: string; code?: string }) {
    // Pasamos la causa si existe
    super(message, { cause: options?.stack });

    this.name = this.constructor.name;
    this.date = new Date();
    this.code = options?.code;

    // Mantener la protoype chain correcta
    Object.setPrototypeOf(this, new.target.prototype);

    // Capturar stack trace si no se proporcionó
    if (!options?.stack && Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Método útil para logging
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      date: this.date.toISOString(),
      stack: this.stack,
      cause: this.cause,
    };
  }
}

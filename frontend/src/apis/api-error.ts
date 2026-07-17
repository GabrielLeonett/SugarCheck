export class ApiError extends Error {
  public readonly code: string;
  public readonly field?: string;
  public readonly statusCode?: number;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    field?: string,
    statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.field = field;
    this.statusCode = statusCode;
  }
}

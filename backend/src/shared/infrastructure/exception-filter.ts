import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ErrorAbstract } from '../error-abstract';
import { getHttpStatus, getErrorCode } from './domain-error-mapper';
import { TranslationService } from './i18n/translation.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly translationService: TranslationService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const lang = this.getLanguage(request);

    let statusCode: number;
    let message: string;
    let code: string = 'UNKNOWN_ERROR';
    let field: string | undefined;

    if (exception instanceof ErrorAbstract) {
      statusCode = getHttpStatus(exception);
      code = getErrorCode(exception);
      field = exception.field;

      const translated = this.translationService.translate(code, lang);
      message = translated !== code ? translated : exception.message;

      if (exception.origin === 'infrastructure') {
        console.error(`[INFRASTRUCTURE_ERROR] ${exception.name}: ${exception.message}`, exception.stack);
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'object' && exResponse !== null) {
        const resp = exResponse as Record<string, any>;
        message = Array.isArray(resp.message) ? resp.message[0] : (resp.message ?? exception.message);
      } else {
        message = String(exResponse);
      }

      code = HttpStatus[statusCode] ?? 'HTTP_ERROR';
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = this.translationService.translate('INTERNAL_ERROR', lang);
      console.error('[UNHANDLED_ERROR]', exception);
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = this.translationService.translate('INTERNAL_ERROR', lang);
    }

    const body: Record<string, any> = {
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (field) {
      body.field = field;
    }

    response.status(statusCode).json(body);
  }

  private getLanguage(request: Request): string {
    return request.headers['accept-language'] as string
      ?? request.headers['x-locale'] as string
      ?? 'es';
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithContext } from '../../common/interfaces/request-with-context.interface';
import { AppLoggerService } from '../logger/app-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<RequestWithContext>();
    const response = http.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception);

    this.logger.error(
      'HTTP request failed',
      GlobalExceptionFilter.name,
      {
        requestId: request.requestId,
        method: request.method,
        path: request.originalUrl ?? request.url,
        statusCode,
        message,
      },
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json({
      error: {
        code: this.extractErrorCode(exception),
        message,
        requestId: request.requestId,
        timestamp: new Date().toISOString(),
        path: request.originalUrl ?? request.url,
      },
    });
  }

  private extractMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const message = response.message;
        return Array.isArray(message) ? message.join(', ') : String(message);
      }

      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private extractErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (
        typeof response === 'object' &&
        response !== null &&
        'code' in response &&
        typeof response.code === 'string'
      ) {
        return response.code;
      }

      return exception.name;
    }

    return 'INTERNAL_SERVER_ERROR';
  }
}

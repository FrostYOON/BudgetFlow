import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLoggerService {
  private readonly logger = new Logger('App');

  log(
    message: string,
    context: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.logger.log(this.formatMessage(message, metadata), context);
  }

  warn(
    message: string,
    context: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.logger.warn(this.formatMessage(message, metadata), context);
  }

  error(
    message: string,
    context: string,
    metadata?: Record<string, unknown>,
    trace?: string,
  ): void {
    this.logger.error(this.formatMessage(message, metadata), trace, context);
  }

  private formatMessage(
    message: string,
    metadata?: Record<string, unknown>,
  ): string {
    if (!metadata || Object.keys(metadata).length === 0) {
      return message;
    }

    return `${message} ${JSON.stringify(metadata)}`;
  }
}

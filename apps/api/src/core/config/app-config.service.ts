import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
  get appName(): string {
    return process.env.APP_NAME ?? 'BudgetFlow API';
  }

  get appVersion(): string {
    return process.env.APP_VERSION ?? '0.1.0';
  }

  get nodeEnv(): string {
    return process.env.NODE_ENV ?? 'development';
  }

  get port(): number {
    return Number(process.env.PORT ?? 3000);
  }

  get apiPrefix(): string {
    return process.env.API_PREFIX ?? 'api/v1';
  }

  get swaggerPath(): string {
    return process.env.SWAGGER_PATH ?? 'docs';
  }
}

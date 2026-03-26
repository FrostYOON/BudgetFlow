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

  get databaseUrl(): string {
    return process.env.DATABASE_URL ?? '';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get jwtAccessSecret(): string {
    return process.env.JWT_ACCESS_SECRET ?? 'budgetflow-dev-access-secret';
  }

  get jwtAccessExpiresInSeconds(): number {
    return Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS ?? 3600);
  }

  get jwtRefreshSecret(): string {
    return process.env.JWT_REFRESH_SECRET ?? 'budgetflow-dev-refresh-secret';
  }

  get jwtRefreshExpiresInSeconds(): number {
    return Number(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS ?? 2_592_000);
  }

  get passwordHashSaltRounds(): number {
    return Number(process.env.PASSWORD_HASH_SALT_ROUNDS ?? 10);
  }
}

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

  get corsOrigins(): string[] {
    const raw = process.env.CORS_ORIGINS ?? '';
    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
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

  get authRefreshCookieName(): string {
    return process.env.AUTH_REFRESH_COOKIE_NAME ?? 'budgetflow_refresh_token';
  }

  get authRefreshCookieDomain(): string | undefined {
    return process.env.AUTH_REFRESH_COOKIE_DOMAIN || undefined;
  }

  get authRefreshCookieSameSite(): 'lax' | 'strict' | 'none' {
    const sameSite = (
      process.env.AUTH_REFRESH_COOKIE_SAME_SITE ?? 'lax'
    ).toLowerCase();

    return sameSite === 'strict' || sameSite === 'none' ? sameSite : 'lax';
  }

  get authRefreshCookieSecure(): boolean {
    return (process.env.AUTH_REFRESH_COOKIE_SECURE ?? '').toLowerCase() ===
      'true'
      ? true
      : this.isProduction;
  }

  get authExposeRefreshTokenInResponse(): boolean {
    return (
      (
        process.env.AUTH_EXPOSE_REFRESH_TOKEN_IN_RESPONSE ?? 'false'
      ).toLowerCase() === 'true'
    );
  }

  get trustProxy(): boolean {
    return (process.env.TRUST_PROXY ?? 'false').toLowerCase() === 'true';
  }

  get passwordHashSaltRounds(): number {
    return Number(process.env.PASSWORD_HASH_SALT_ROUNDS ?? 10);
  }
}

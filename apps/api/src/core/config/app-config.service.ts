import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get appName(): string {
    return this.configService.get<string>('APP_NAME') ?? 'BudgetFlow API';
  }

  get appVersion(): string {
    return this.configService.get<string>('APP_VERSION') ?? '0.1.0';
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') ?? 'development';
  }

  get port(): number {
    return Number(this.configService.get<string>('PORT') ?? 3000);
  }

  get apiPrefix(): string {
    return this.configService.get<string>('API_PREFIX') ?? 'api/v1';
  }

  get corsOrigins(): string[] {
    const raw = this.configService.get<string>('CORS_ORIGINS') ?? '';
    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get swaggerPath(): string {
    return this.configService.get<string>('SWAGGER_PATH') ?? 'docs';
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL') ?? '';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get jwtAccessSecret(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      'budgetflow-dev-access-secret'
    );
  }

  get jwtAccessExpiresInSeconds(): number {
    return Number(
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN_SECONDS') ?? 3600,
    );
  }

  get jwtRefreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'budgetflow-dev-refresh-secret'
    );
  }

  get jwtRefreshExpiresInSeconds(): number {
    return Number(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN_SECONDS') ??
        2_592_000,
    );
  }

  get authRefreshCookieName(): string {
    return (
      this.configService.get<string>('AUTH_REFRESH_COOKIE_NAME') ??
      'budgetflow_refresh_token'
    );
  }

  get authRefreshCookieDomain(): string | undefined {
    return (
      this.configService.get<string>('AUTH_REFRESH_COOKIE_DOMAIN') || undefined
    );
  }

  get authRefreshCookieSameSite(): 'lax' | 'strict' | 'none' {
    const sameSite = (
      this.configService.get<string>('AUTH_REFRESH_COOKIE_SAME_SITE') ?? 'lax'
    ).toLowerCase();

    return sameSite === 'strict' || sameSite === 'none' ? sameSite : 'lax';
  }

  get authRefreshCookieSecure(): boolean {
    return (
      this.configService.get<string>('AUTH_REFRESH_COOKIE_SECURE') ?? ''
    ).toLowerCase() === 'true'
      ? true
      : this.isProduction;
  }

  get authExposeRefreshTokenInResponse(): boolean {
    return (
      (
        this.configService.get<string>(
          'AUTH_EXPOSE_REFRESH_TOKEN_IN_RESPONSE',
        ) ?? 'false'
      ).toLowerCase() === 'true'
    );
  }

  get trustProxy(): boolean {
    return (
      (
        this.configService.get<string>('TRUST_PROXY') ?? 'false'
      ).toLowerCase() === 'true'
    );
  }

  get passwordHashSaltRounds(): number {
    return Number(
      this.configService.get<string>('PASSWORD_HASH_SALT_ROUNDS') ?? 10,
    );
  }

  get recurringExecutionSchedulerEnabled(): boolean {
    return (
      (
        this.configService.get<string>(
          'RECURRING_EXECUTION_SCHEDULER_ENABLED',
        ) ?? 'true'
      ).toLowerCase() === 'true'
    );
  }

  get recurringExecutionCron(): string {
    return (
      this.configService.get<string>('RECURRING_EXECUTION_CRON') ??
      '5,20,35,50 * * * *'
    );
  }

  get recurringFailureNotificationWebhookUrl(): string | undefined {
    return (
      this.configService.get<string>(
        'RECURRING_FAILURE_NOTIFICATION_WEBHOOK_URL',
      ) || undefined
    );
  }

  get recurringFailureNotificationThrottleMinutes(): number {
    return Number(
      this.configService.get<string>(
        'RECURRING_FAILURE_NOTIFICATION_THROTTLE_MINUTES',
      ) ?? 60,
    );
  }
}

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@budgetflow/database';
import { AppConfigService } from '../config/app-config.service';
import { AppLoggerService } from '../logger/app-logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    super({
      datasources: {
        db: {
          url: appConfig.databaseUrl || undefined,
        },
      },
      log: appConfig.isProduction ? ['error'] : ['error', 'warn'],
    });
  }

  async onModuleInit(): Promise<void> {
    if (!this.appConfig.databaseUrl) {
      this.logger.warn(
        'DATABASE_URL is not set. Prisma connection was skipped.',
        PrismaService.name,
      );
      return;
    }

    await this.$connect();
    this.logger.log('Prisma connected to database', PrismaService.name);
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database', PrismaService.name);
  }
}

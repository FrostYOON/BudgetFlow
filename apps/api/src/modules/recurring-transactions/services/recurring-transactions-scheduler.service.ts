import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppConfigService } from '../../../core/config/app-config.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppLoggerService } from '../../../core/logger/app-logger.service';
import { RecurringTransactionsService } from './recurring-transactions.service';

const RECURRING_EXECUTION_CRON =
  process.env.RECURRING_EXECUTION_CRON ?? '5,20,35,50 * * * *';

@Injectable()
export class RecurringTransactionsSchedulerService {
  private readonly context = 'RecurringTransactionsSchedulerService';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly logger: AppLoggerService,
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Cron(RECURRING_EXECUTION_CRON, {
    name: 'recurring-transactions-auto-execute',
    timeZone: 'UTC',
  })
  async handleRecurringExecution(): Promise<void> {
    if (!this.config.recurringExecutionSchedulerEnabled) {
      return;
    }

    const now = new Date();
    const workspaces = await this.prisma.workspace.findMany({
      select: {
        id: true,
        timezone: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    for (const workspace of workspaces) {
      let localTime: LocalTimeParts;

      try {
        localTime = this.getLocalTimeParts(now, workspace.timezone);
      } catch (error) {
        this.logger.error(
          'Failed to resolve workspace timezone for recurring execution.',
          this.context,
          {
            workspaceId: workspace.id,
            timezone: workspace.timezone,
          },
          error instanceof Error ? error.stack : undefined,
        );
        continue;
      }

      if (localTime.hour !== 0 || localTime.minute >= 15) {
        continue;
      }

      const executionDate = new Date(
        Date.UTC(localTime.year, localTime.month - 1, localTime.day),
      );

      try {
        const result =
          await this.recurringTransactionsService.executeAutomaticDaily(
            workspace.id,
            executionDate,
          );

        if (
          result.summary.createdCount > 0 ||
          result.summary.skippedCount > 0
        ) {
          this.logger.log(
            'Processed recurring transactions for workspace.',
            this.context,
            {
              workspaceId: workspace.id,
              executionDate: executionDate.toISOString().slice(0, 10),
              createdCount: result.summary.createdCount,
              skippedCount: result.summary.skippedCount,
            },
          );
        }
      } catch (error) {
        this.logger.error(
          'Recurring execution job failed for workspace.',
          this.context,
          {
            workspaceId: workspace.id,
            executionDate: executionDate.toISOString().slice(0, 10),
          },
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  private getLocalTimeParts(date: Date, timeZone: string): LocalTimeParts {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(date);
    const values = new Map(parts.map((part) => [part.type, part.value]));

    return {
      year: Number(values.get('year')),
      month: Number(values.get('month')),
      day: Number(values.get('day')),
      hour: Number(values.get('hour')),
      minute: Number(values.get('minute')),
    };
  }
}

type LocalTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

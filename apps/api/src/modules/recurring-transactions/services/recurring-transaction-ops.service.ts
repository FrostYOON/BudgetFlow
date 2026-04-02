import { Injectable } from '@nestjs/common';
import { RecurringExecutionRunStatus } from '@budgetflow/database';
import { AppConfigService } from '../../../core/config/app-config.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { RecurringOpsSummaryResponseDto } from '../dto/recurring-ops-summary-response.dto';
import { toRecurringExecutionRunResponse } from '../utils/to-recurring-execution-run-response.util';

@Injectable()
export class RecurringTransactionOpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
    private readonly config: AppConfigService,
  ) {}

  async getOpsSummary(
    workspaceId: string,
    userId: string,
  ): Promise<RecurringOpsSummaryResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

    const [workspace, activeCount, inactiveCount, runs, recentRuns] =
      await Promise.all([
        this.prisma.workspace.findUniqueOrThrow({
          where: {
            id: workspaceId,
          },
          select: {
            id: true,
            timezone: true,
          },
        }),
        this.prisma.recurringTransaction.count({
          where: {
            workspaceId,
            isActive: true,
          },
        }),
        this.prisma.recurringTransaction.count({
          where: {
            workspaceId,
            isActive: false,
          },
        }),
        this.prisma.recurringExecutionRun.findMany({
          where: {
            workspaceId,
          },
          include: {
            initiatedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [{ startedAt: 'desc' }, { createdAt: 'desc' }],
          take: 10,
        }),
        this.prisma.recurringExecutionRun.findMany({
          where: {
            workspaceId,
            startedAt: {
              gte: sevenDaysAgo,
            },
          },
          select: {
            status: true,
            createdCount: true,
            skippedCount: true,
          },
        }),
      ]);

    const lastRun = runs[0] ?? null;
    const lastSuccessfulRun =
      runs.find((run) => run.status === RecurringExecutionRunStatus.SUCCESS) ??
      null;
    const lastFailedRun =
      runs.find((run) => run.status === RecurringExecutionRunStatus.FAILED) ??
      null;
    const recentFailures = runs
      .filter((run) => run.status === RecurringExecutionRunStatus.FAILED)
      .slice(0, 5);

    const totalRuns = recentRuns.length;
    const successRuns = recentRuns.filter(
      (run) => run.status === RecurringExecutionRunStatus.SUCCESS,
    ).length;
    const failedRuns = recentRuns.filter(
      (run) => run.status === RecurringExecutionRunStatus.FAILED,
    ).length;
    const createdTransactions = recentRuns.reduce(
      (sum, run) => sum + (run.createdCount ?? 0),
      0,
    );
    const skippedTransactions = recentRuns.reduce(
      (sum, run) => sum + (run.skippedCount ?? 0),
      0,
    );

    const currentLocalDate = this.getLocalDateString(now, workspace.timezone);
    const nextTargetDate = this.getNextTargetDate(
      now,
      workspace.timezone,
      lastRun?.targetDate ?? null,
    );

    return {
      scheduler: {
        enabled: this.config.recurringExecutionSchedulerEnabled,
        cron: this.config.recurringExecutionCron,
        workspaceTimezone: workspace.timezone,
        currentLocalDate,
        nextTargetDate,
      },
      recurringTransactions: {
        activeCount,
        inactiveCount,
      },
      last7Days: {
        totalRuns,
        successRuns,
        failedRuns,
        createdTransactions,
        skippedTransactions,
      },
      lastRun: lastRun ? toRecurringExecutionRunResponse(lastRun) : null,
      lastSuccessfulRun: lastSuccessfulRun
        ? toRecurringExecutionRunResponse(lastSuccessfulRun)
        : null,
      lastFailedRun: lastFailedRun
        ? toRecurringExecutionRunResponse(lastFailedRun)
        : null,
      recentFailures: recentFailures.map((run) =>
        toRecurringExecutionRunResponse(run),
      ),
    };
  }

  private getLocalDateString(date: Date, timeZone: string): string {
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

    return `${values.get('year')}-${values.get('month')}-${values.get('day')}`;
  }

  private getNextTargetDate(
    now: Date,
    timeZone: string,
    lastRunTargetDate: Date | null,
  ): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(now);
    const values = new Map(parts.map((part) => [part.type, part.value]));
    const year = Number(values.get('year'));
    const month = Number(values.get('month'));
    const day = Number(values.get('day'));
    const hour = Number(values.get('hour'));
    const minute = Number(values.get('minute'));

    const today = `${values.get('year')}-${values.get('month')}-${values.get('day')}`;
    const lastRunDate = lastRunTargetDate
      ? lastRunTargetDate.toISOString().slice(0, 10)
      : null;
    const shouldUseToday = hour === 0 && minute < 15 && lastRunDate !== today;

    if (shouldUseToday) {
      return today;
    }

    const nextDate = new Date(Date.UTC(year, month - 1, day));
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    return nextDate.toISOString().slice(0, 10);
  }
}

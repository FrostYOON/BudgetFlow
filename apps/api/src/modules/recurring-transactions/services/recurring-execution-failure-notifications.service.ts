import { RecurringExecutionRunStatus } from '@budgetflow/database';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../core/config/app-config.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppLoggerService } from '../../../core/logger/app-logger.service';

@Injectable()
export class RecurringExecutionFailureNotificationsService {
  private readonly context = 'RecurringExecutionFailureNotificationsService';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  async notifyRunFailure(runId: string): Promise<void> {
    if (!this.config.recurringFailureNotificationWebhookUrl) {
      return;
    }

    const failedRun = await this.prisma.recurringExecutionRun.findUnique({
      where: {
        id: runId,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            timezone: true,
          },
        },
      },
    });

    if (!failedRun || failedRun.status !== RecurringExecutionRunStatus.FAILED) {
      return;
    }

    const errorSummary = failedRun.errorMessage ?? 'Unknown execution error.';
    const throttleCutoff = new Date(
      Date.now() -
        this.config.recurringFailureNotificationThrottleMinutes * 60 * 1000,
    );

    const recentFailure = await this.prisma.recurringExecutionRun.findFirst({
      where: {
        workspaceId: failedRun.workspaceId,
        status: RecurringExecutionRunStatus.FAILED,
        targetDate: failedRun.targetDate,
        errorMessage: errorSummary,
        finishedAt: {
          gte: throttleCutoff,
        },
        id: {
          not: failedRun.id,
        },
      },
      orderBy: {
        finishedAt: 'desc',
      },
      select: {
        id: true,
      },
    });

    if (recentFailure) {
      this.logger.warn(
        'Skipped recurring failure notification due to throttle window.',
        this.context,
        {
          runId: failedRun.id,
          workspaceId: failedRun.workspaceId,
          targetDate: failedRun.targetDate.toISOString().slice(0, 10),
          throttledByRunId: recentFailure.id,
        },
      );
      return;
    }

    const payload = {
      event: 'recurring_execution_failed',
      runId: failedRun.id,
      triggerType: failedRun.triggerType,
      workspace: {
        id: failedRun.workspace.id,
        name: failedRun.workspace.name,
        timezone: failedRun.workspace.timezone,
      },
      targetDate: failedRun.targetDate.toISOString().slice(0, 10),
      errorSummary,
      occurredAt:
        failedRun.finishedAt?.toISOString() ??
        failedRun.updatedAt.toISOString(),
    };

    try {
      const response = await fetch(
        this.config.recurringFailureNotificationWebhookUrl,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        this.logger.error(
          'Recurring failure notification webhook returned a non-2xx response.',
          this.context,
          {
            runId: failedRun.id,
            workspaceId: failedRun.workspaceId,
            statusCode: response.status,
          },
        );
        return;
      }

      this.logger.log('Sent recurring failure notification.', this.context, {
        runId: failedRun.id,
        workspaceId: failedRun.workspaceId,
        targetDate: payload.targetDate,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send recurring failure notification.',
        this.context,
        {
          runId: failedRun.id,
          workspaceId: failedRun.workspaceId,
        },
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

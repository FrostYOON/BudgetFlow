import { Injectable } from '@nestjs/common';
import {
  Prisma,
  RecurringExecutionRun,
  RecurringExecutionRunStatus,
  RecurringExecutionTriggerType,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { ExecuteRecurringTransactionsResponseDto } from '../dto/execute-recurring-transactions-response.dto';
import { RecurringExecutionRunResponseDto } from '../dto/recurring-execution-run-response.dto';
import { RerunRecurringTransactionsRequestDto } from '../dto/rerun-recurring-transactions-request.dto';
import { RerunRecurringTransactionsResponseDto } from '../dto/rerun-recurring-transactions-response.dto';
import { RecurringTransactionsService } from './recurring-transactions.service';

type RecurringExecutionRunWithInitiator =
  Prisma.RecurringExecutionRunGetPayload<{
    include: {
      initiatedBy: {
        select: {
          id: true;
          name: true;
        };
      };
    };
  }>;

@Injectable()
export class RecurringTransactionExecutionRunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  async listRuns(
    workspaceId: string,
    userId: string,
    limit = 20,
  ): Promise<RecurringExecutionRunResponseDto[]> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const runs = await this.prisma.recurringExecutionRun.findMany({
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
      take: limit,
    });

    return runs.map((run) => this.toRunResponse(run));
  }

  async rerunForDate(
    workspaceId: string,
    userId: string,
    input: RerunRecurringTransactionsRequestDto,
  ): Promise<RerunRecurringTransactionsResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const executionDate = this.toExecutionDate(input.executionDate);
    const dryRun = input.dryRun ?? false;

    if (dryRun) {
      return {
        run: null,
        result: await this.recurringTransactionsService.executeAutomaticDaily(
          workspaceId,
          executionDate,
          true,
        ),
      };
    }

    const run = await this.startRun({
      workspaceId,
      targetDate: executionDate,
      triggerType: RecurringExecutionTriggerType.MANUAL,
      initiatedByUserId: userId,
    });

    try {
      const result =
        await this.recurringTransactionsService.executeAutomaticDaily(
          workspaceId,
          executionDate,
          false,
        );

      const completedRun = await this.completeRun(run.id, result);

      return {
        run: this.toRunResponse(completedRun),
        result,
      };
    } catch (error) {
      await this.failRun(
        run.id,
        error instanceof Error ? error.message : 'Unknown execution error.',
      );
      throw error;
    }
  }

  async runScheduledForDate(
    workspaceId: string,
    executionDate: Date,
  ): Promise<RecurringExecutionRunResponseDto> {
    const run = await this.startRun({
      workspaceId,
      targetDate: executionDate,
      triggerType: RecurringExecutionTriggerType.SCHEDULED,
      initiatedByUserId: null,
    });

    try {
      const result =
        await this.recurringTransactionsService.executeAutomaticDaily(
          workspaceId,
          executionDate,
          false,
        );

      const completedRun = await this.completeRun(run.id, result);
      return this.toRunResponse(completedRun);
    } catch (error) {
      const failedRun = await this.failRun(
        run.id,
        error instanceof Error ? error.message : 'Unknown execution error.',
      );
      return this.toRunResponse(failedRun);
    }
  }

  private async startRun(input: {
    workspaceId: string;
    targetDate: Date;
    triggerType: RecurringExecutionTriggerType;
    initiatedByUserId: string | null;
  }): Promise<RecurringExecutionRun> {
    return this.prisma.recurringExecutionRun.create({
      data: {
        workspaceId: input.workspaceId,
        targetDate: input.targetDate,
        triggerType: input.triggerType,
        status: RecurringExecutionRunStatus.RUNNING,
        initiatedByUserId: input.initiatedByUserId,
      },
    });
  }

  private async completeRun(
    runId: string,
    result: ExecuteRecurringTransactionsResponseDto,
  ): Promise<RecurringExecutionRunWithInitiator> {
    return this.prisma.recurringExecutionRun.update({
      where: {
        id: runId,
      },
      data: {
        status: RecurringExecutionRunStatus.SUCCESS,
        candidateCount: result.summary.candidateCount,
        createdCount: result.summary.createdCount,
        skippedCount: result.summary.skippedCount,
        finishedAt: new Date(),
        errorMessage: null,
      },
      include: {
        initiatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private async failRun(
    runId: string,
    errorMessage: string,
  ): Promise<RecurringExecutionRunWithInitiator> {
    return this.prisma.recurringExecutionRun.update({
      where: {
        id: runId,
      },
      data: {
        status: RecurringExecutionRunStatus.FAILED,
        finishedAt: new Date(),
        errorMessage,
      },
      include: {
        initiatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private toExecutionDate(input: string): Date {
    const value = new Date(input);

    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }

  private toRunResponse(
    run: RecurringExecutionRunWithInitiator,
  ): RecurringExecutionRunResponseDto {
    return {
      id: run.id,
      workspaceId: run.workspaceId,
      triggerType: run.triggerType,
      status: run.status,
      targetDate: run.targetDate.toISOString().slice(0, 10),
      initiatedByUserId: run.initiatedByUserId,
      initiatedByUserName: run.initiatedBy?.name ?? null,
      candidateCount: run.candidateCount ?? null,
      createdCount: run.createdCount ?? null,
      skippedCount: run.skippedCount ?? null,
      errorMessage: run.errorMessage,
      startedAt: run.startedAt.toISOString(),
      finishedAt: run.finishedAt?.toISOString() ?? null,
    };
  }
}

import { Prisma } from '@budgetflow/database';
import { RecurringExecutionRunResponseDto } from '../dto/recurring-execution-run-response.dto';

export type RecurringExecutionRunWithInitiator =
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

export function toRecurringExecutionRunResponse(
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

import {
  RecurringExecutionRunStatus,
  RecurringExecutionTriggerType,
} from '@budgetflow/database';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from '../../../core/config/app-config.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { RecurringTransactionOpsService } from './recurring-transaction-ops.service';

describe('RecurringTransactionOpsService', () => {
  let service: RecurringTransactionOpsService;
  let prisma: {
    workspace: {
      findUniqueOrThrow: jest.Mock;
    };
    recurringTransaction: {
      count: jest.Mock;
    };
    recurringExecutionRun: {
      findMany: jest.Mock;
    };
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
  };
  let config: {
    recurringExecutionSchedulerEnabled: boolean;
    recurringExecutionCron: string;
  };

  beforeEach(async () => {
    prisma = {
      workspace: {
        findUniqueOrThrow: jest.fn(),
      },
      recurringTransaction: {
        count: jest.fn(),
      },
      recurringExecutionRun: {
        findMany: jest.fn(),
      },
    };
    workspacesService = {
      assertMemberAccess: jest.fn(),
    };
    config = {
      recurringExecutionSchedulerEnabled: true,
      recurringExecutionCron: '5,20,35,50 * * * *',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionOpsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: WorkspacesService,
          useValue: workspacesService,
        },
        {
          provide: AppConfigService,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<RecurringTransactionOpsService>(
      RecurringTransactionOpsService,
    );
  });

  it('getOpsSummary should return scheduler, counts, and recent run summaries', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-26T15:05:00.000Z'));

    prisma.workspace.findUniqueOrThrow.mockResolvedValue({
      id: 'workspace-1',
      timezone: 'Asia/Seoul',
    });
    prisma.recurringTransaction.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1);
    prisma.recurringExecutionRun.findMany
      .mockResolvedValueOnce([
        {
          id: 'run-1',
          workspaceId: 'workspace-1',
          triggerType: RecurringExecutionTriggerType.SCHEDULED,
          status: RecurringExecutionRunStatus.SUCCESS,
          targetDate: new Date('2026-03-27T00:00:00.000Z'),
          initiatedByUserId: null,
          initiatedBy: null,
          candidateCount: 2,
          createdCount: 2,
          skippedCount: 0,
          errorMessage: null,
          startedAt: new Date('2026-03-26T15:05:00.000Z'),
          finishedAt: new Date('2026-03-26T15:05:03.000Z'),
          createdAt: new Date('2026-03-26T15:05:00.000Z'),
          updatedAt: new Date('2026-03-26T15:05:03.000Z'),
        },
        {
          id: 'run-2',
          workspaceId: 'workspace-1',
          triggerType: RecurringExecutionTriggerType.MANUAL,
          status: RecurringExecutionRunStatus.FAILED,
          targetDate: new Date('2026-03-26T00:00:00.000Z'),
          initiatedByUserId: 'user-1',
          initiatedBy: {
            id: 'user-1',
            name: 'Minji',
          },
          candidateCount: null,
          createdCount: null,
          skippedCount: null,
          errorMessage: 'Manual rerun failed.',
          startedAt: new Date('2026-03-26T01:00:00.000Z'),
          finishedAt: new Date('2026-03-26T01:00:02.000Z'),
          createdAt: new Date('2026-03-26T01:00:00.000Z'),
          updatedAt: new Date('2026-03-26T01:00:02.000Z'),
        },
      ])
      .mockResolvedValueOnce([
        {
          status: RecurringExecutionRunStatus.SUCCESS,
          createdCount: 2,
          skippedCount: 0,
        },
        {
          status: RecurringExecutionRunStatus.FAILED,
          createdCount: null,
          skippedCount: null,
        },
      ]);

    const result = await service.getOpsSummary('workspace-1', 'user-1');

    expect(result.scheduler.workspaceTimezone).toBe('Asia/Seoul');
    expect(result.scheduler.currentLocalDate).toBe('2026-03-27');
    expect(result.scheduler.nextTargetDate).toBe('2026-03-28');
    expect(result.recurringTransactions.activeCount).toBe(3);
    expect(result.last7Days.totalRuns).toBe(2);
    expect(result.last7Days.failedRuns).toBe(1);
    expect(result.lastFailedRun?.id).toBe('run-2');
    expect(result.recentFailures).toHaveLength(1);

    jest.useRealTimers();
  });
});

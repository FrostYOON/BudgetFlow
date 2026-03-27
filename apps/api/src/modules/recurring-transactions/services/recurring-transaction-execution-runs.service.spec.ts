import {
  RecurringExecutionRunStatus,
  RecurringExecutionTriggerType,
} from '@budgetflow/database';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransactionExecutionRunsService } from './recurring-transaction-execution-runs.service';

describe('RecurringTransactionExecutionRunsService', () => {
  let service: RecurringTransactionExecutionRunsService;
  let prisma: {
    recurringExecutionRun: {
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
  };
  let recurringTransactionsService: {
    executeAutomaticDaily: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      recurringExecutionRun: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    workspacesService = {
      assertMemberAccess: jest.fn(),
    };
    recurringTransactionsService = {
      executeAutomaticDaily: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionExecutionRunsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: WorkspacesService,
          useValue: workspacesService,
        },
        {
          provide: RecurringTransactionsService,
          useValue: recurringTransactionsService,
        },
      ],
    }).compile();

    service = module.get<RecurringTransactionExecutionRunsService>(
      RecurringTransactionExecutionRunsService,
    );
  });

  it('listRuns should return execution history for a workspace', async () => {
    prisma.recurringExecutionRun.findMany.mockResolvedValue([
      {
        id: 'run-1',
        workspaceId: 'workspace-1',
        triggerType: RecurringExecutionTriggerType.MANUAL,
        status: RecurringExecutionRunStatus.SUCCESS,
        targetDate: new Date('2026-03-25T00:00:00.000Z'),
        initiatedByUserId: 'user-1',
        initiatedBy: {
          id: 'user-1',
          name: 'Minji',
        },
        candidateCount: 2,
        createdCount: 1,
        skippedCount: 1,
        errorMessage: null,
        startedAt: new Date('2026-03-25T00:05:00.000Z'),
        finishedAt: new Date('2026-03-25T00:05:05.000Z'),
        createdAt: new Date('2026-03-25T00:05:00.000Z'),
        updatedAt: new Date('2026-03-25T00:05:05.000Z'),
      },
    ]);

    const result = await service.listRuns('workspace-1', 'user-1', 10);

    expect(workspacesService.assertMemberAccess).toHaveBeenCalledWith(
      'workspace-1',
      'user-1',
    );
    expect(result[0]?.initiatedByUserName).toBe('Minji');
  });

  it('rerunForDate should persist a manual run and return the run with result', async () => {
    prisma.recurringExecutionRun.create.mockResolvedValue({
      id: 'run-1',
    });
    recurringTransactionsService.executeAutomaticDaily.mockResolvedValue({
      year: 2026,
      month: 3,
      dryRun: false,
      summary: {
        candidateCount: 1,
        createdCount: 1,
        skippedCount: 0,
      },
      items: [],
    });
    prisma.recurringExecutionRun.update.mockResolvedValue({
      id: 'run-1',
      workspaceId: 'workspace-1',
      triggerType: RecurringExecutionTriggerType.MANUAL,
      status: RecurringExecutionRunStatus.SUCCESS,
      targetDate: new Date('2026-03-25T00:00:00.000Z'),
      initiatedByUserId: 'user-1',
      initiatedBy: {
        id: 'user-1',
        name: 'Minji',
      },
      candidateCount: 1,
      createdCount: 1,
      skippedCount: 0,
      errorMessage: null,
      startedAt: new Date('2026-03-25T00:05:00.000Z'),
      finishedAt: new Date('2026-03-25T00:05:05.000Z'),
      createdAt: new Date('2026-03-25T00:05:00.000Z'),
      updatedAt: new Date('2026-03-25T00:05:05.000Z'),
    });

    const result = await service.rerunForDate('workspace-1', 'user-1', {
      executionDate: '2026-03-25',
    });

    expect(result.run?.status).toBe(RecurringExecutionRunStatus.SUCCESS);
    expect(
      recurringTransactionsService.executeAutomaticDaily,
    ).toHaveBeenCalledWith(
      'workspace-1',
      new Date('2026-03-25T00:00:00.000Z'),
      false,
    );
  });

  it('rerunForDate should skip persistence for dryRun', async () => {
    recurringTransactionsService.executeAutomaticDaily.mockResolvedValue({
      year: 2026,
      month: 3,
      dryRun: true,
      summary: {
        candidateCount: 1,
        createdCount: 0,
        skippedCount: 1,
      },
      items: [],
    });

    const result = await service.rerunForDate('workspace-1', 'user-1', {
      executionDate: '2026-03-25',
      dryRun: true,
    });

    expect(result.run).toBeNull();
    expect(prisma.recurringExecutionRun.create).not.toHaveBeenCalled();
  });
});

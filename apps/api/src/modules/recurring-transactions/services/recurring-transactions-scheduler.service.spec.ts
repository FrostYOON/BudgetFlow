import { RecurringExecutionRunStatus } from '@budgetflow/database';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from '../../../core/config/app-config.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppLoggerService } from '../../../core/logger/app-logger.service';
import { RecurringTransactionExecutionRunsService } from './recurring-transaction-execution-runs.service';
import { RecurringTransactionsSchedulerService } from './recurring-transactions-scheduler.service';

describe('RecurringTransactionsSchedulerService', () => {
  let service: RecurringTransactionsSchedulerService;
  let prisma: {
    workspace: {
      findMany: jest.Mock;
    };
  };
  let config: {
    recurringExecutionSchedulerEnabled: boolean;
  };
  let logger: {
    log: jest.Mock;
    error: jest.Mock;
  };
  let recurringTransactionExecutionRunsService: {
    runScheduledForDate: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      workspace: {
        findMany: jest.fn(),
      },
    };
    config = {
      recurringExecutionSchedulerEnabled: true,
    };
    logger = {
      log: jest.fn(),
      error: jest.fn(),
    };
    recurringTransactionExecutionRunsService = {
      runScheduledForDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionsSchedulerService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: AppConfigService,
          useValue: config,
        },
        {
          provide: AppLoggerService,
          useValue: logger,
        },
        {
          provide: RecurringTransactionExecutionRunsService,
          useValue: recurringTransactionExecutionRunsService,
        },
      ],
    }).compile();

    service = module.get<RecurringTransactionsSchedulerService>(
      RecurringTransactionsSchedulerService,
    );
  });

  it('handleRecurringExecution should execute workspaces that are in local midnight window', async () => {
    prisma.workspace.findMany.mockResolvedValue([
      {
        id: 'workspace-1',
        timezone: 'UTC',
      },
      {
        id: 'workspace-2',
        timezone: 'Asia/Seoul',
      },
    ]);
    recurringTransactionExecutionRunsService.runScheduledForDate.mockResolvedValue(
      {
        id: 'run-1',
        status: RecurringExecutionRunStatus.SUCCESS,
        createdCount: 1,
        skippedCount: 0,
      },
    );

    jest.useFakeTimers().setSystemTime(new Date('2026-03-27T00:05:00.000Z'));

    await service.handleRecurringExecution();

    expect(
      recurringTransactionExecutionRunsService.runScheduledForDate,
    ).toHaveBeenCalledTimes(1);
    expect(
      recurringTransactionExecutionRunsService.runScheduledForDate,
    ).toHaveBeenCalledWith('workspace-1', new Date('2026-03-27T00:00:00.000Z'));

    jest.useRealTimers();
  });

  it('handleRecurringExecution should stop when scheduler is disabled', async () => {
    config.recurringExecutionSchedulerEnabled = false;

    await service.handleRecurringExecution();

    expect(prisma.workspace.findMany).not.toHaveBeenCalled();
  });
});

import {
  RecurringExecutionRunStatus,
  RecurringExecutionTriggerType,
} from '@budgetflow/database';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from '../../../core/config/app-config.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppLoggerService } from '../../../core/logger/app-logger.service';
import { RecurringExecutionFailureNotificationsService } from './recurring-execution-failure-notifications.service';

describe('RecurringExecutionFailureNotificationsService', () => {
  let service: RecurringExecutionFailureNotificationsService;
  let prisma: {
    recurringExecutionRun: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  let config: {
    recurringFailureNotificationWebhookUrl?: string;
    recurringFailureNotificationThrottleMinutes: number;
  };
  let logger: {
    log: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
  };
  let originalFetch: typeof global.fetch;

  beforeEach(async () => {
    prisma = {
      recurringExecutionRun: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    config = {
      recurringFailureNotificationWebhookUrl:
        'https://example.com/recurring-failure-hook',
      recurringFailureNotificationThrottleMinutes: 60,
    };
    logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    }) as unknown as typeof fetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringExecutionFailureNotificationsService,
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
      ],
    }).compile();

    service = module.get<RecurringExecutionFailureNotificationsService>(
      RecurringExecutionFailureNotificationsService,
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should do nothing when the webhook is not configured', async () => {
    config.recurringFailureNotificationWebhookUrl = undefined;

    await service.notifyRunFailure('run-1');

    expect(prisma.recurringExecutionRun.findUnique).not.toHaveBeenCalled();
  });

  it('should send a webhook when there is no recent duplicate failure', async () => {
    prisma.recurringExecutionRun.findUnique.mockResolvedValue({
      id: 'run-1',
      workspaceId: 'workspace-1',
      triggerType: RecurringExecutionTriggerType.SCHEDULED,
      status: RecurringExecutionRunStatus.FAILED,
      targetDate: new Date('2026-03-28T00:00:00.000Z'),
      errorMessage: 'Recurring execution failed',
      finishedAt: new Date('2026-03-28T00:05:00.000Z'),
      updatedAt: new Date('2026-03-28T00:05:00.000Z'),
      workspace: {
        id: 'workspace-1',
        name: 'Home',
        timezone: 'Asia/Seoul',
      },
    });
    prisma.recurringExecutionRun.findFirst.mockResolvedValue(null);

    await service.notifyRunFailure('run-1');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/recurring-failure-hook',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(logger.log).toHaveBeenCalled();
  });

  it('should skip webhook delivery when a recent duplicate failure exists', async () => {
    prisma.recurringExecutionRun.findUnique.mockResolvedValue({
      id: 'run-1',
      workspaceId: 'workspace-1',
      triggerType: RecurringExecutionTriggerType.SCHEDULED,
      status: RecurringExecutionRunStatus.FAILED,
      targetDate: new Date('2026-03-28T00:00:00.000Z'),
      errorMessage: 'Recurring execution failed',
      finishedAt: new Date('2026-03-28T00:05:00.000Z'),
      updatedAt: new Date('2026-03-28T00:05:00.000Z'),
      workspace: {
        id: 'workspace-1',
        name: 'Home',
        timezone: 'Asia/Seoul',
      },
    });
    prisma.recurringExecutionRun.findFirst.mockResolvedValue({
      id: 'run-previous',
    });

    await service.notifyRunFailure('run-1');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });
});

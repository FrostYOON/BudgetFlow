import {
  Prisma,
  RecurringRepeatUnit,
  TransactionType,
  TransactionVisibility,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { RecurringTransactionsService } from './recurring-transactions.service';

describe('RecurringTransactionsService', () => {
  let service: RecurringTransactionsService;
  let prisma: {
    workspaceMember: { findUnique: jest.Mock };
    category: { findFirst: jest.Mock };
    transaction: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
    recurringTransaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      workspaceMember: {
        findUnique: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
      },
      transaction: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      recurringTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: WorkspacesService,
          useValue: workspacesService,
        },
      ],
    }).compile();

    service = module.get<RecurringTransactionsService>(
      RecurringTransactionsService,
    );
  });

  it('create should create a monthly recurring transaction', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue({
      status: WorkspaceMemberStatus.ACTIVE,
    });
    prisma.recurringTransaction.create.mockResolvedValue({
      id: 'recurring-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('55000.00'),
      currency: 'KRW',
      categoryId: null,
      category: null,
      memo: 'Netflix',
      paidByUserId: 'user-1',
      paidBy: { name: 'Jisu' },
      repeatUnit: RecurringRepeatUnit.MONTHLY,
      repeatInterval: 1,
      dayOfMonth: 25,
      dayOfWeek: null,
      startDate: new Date('2026-03-25T00:00:00.000Z'),
      endDate: null,
      isActive: true,
      createdByUserId: 'user-1',
      createdAt: new Date('2026-03-25T10:00:00.000Z'),
      updatedAt: new Date('2026-03-25T10:00:00.000Z'),
    });

    const result = await service.create('workspace-1', 'user-1', {
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: '55000.00',
      currency: 'KRW',
      memo: 'Netflix',
      repeatUnit: RecurringRepeatUnit.MONTHLY,
      repeatInterval: 1,
      dayOfMonth: 25,
      startDate: '2026-03-25',
    });

    expect(result.repeatUnit).toBe(RecurringRepeatUnit.MONTHLY);
    expect(result.dayOfMonth).toBe(25);
  });

  it('create should reject invalid weekly/monthly rule combinations', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue({
      status: WorkspaceMemberStatus.ACTIVE,
    });

    await expect(
      service.create('workspace-1', 'user-1', {
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: '55000.00',
        currency: 'KRW',
        repeatUnit: RecurringRepeatUnit.WEEKLY,
        repeatInterval: 1,
        dayOfMonth: 25,
        startDate: '2026-03-25',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('list should return recurring transactions', async () => {
    prisma.recurringTransaction.findMany.mockResolvedValue([
      {
        id: 'recurring-1',
        workspaceId: 'workspace-1',
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: new Prisma.Decimal('55000.00'),
        currency: 'KRW',
        categoryId: null,
        category: null,
        memo: 'Netflix',
        paidByUserId: 'user-1',
        paidBy: { name: 'Jisu' },
        repeatUnit: RecurringRepeatUnit.MONTHLY,
        repeatInterval: 1,
        dayOfMonth: 25,
        dayOfWeek: null,
        startDate: new Date('2026-03-25T00:00:00.000Z'),
        endDate: null,
        isActive: true,
        createdByUserId: 'user-1',
        createdAt: new Date('2026-03-25T10:00:00.000Z'),
        updatedAt: new Date('2026-03-25T10:00:00.000Z'),
      },
    ]);

    const result = await service.list('workspace-1', 'user-1', {});

    expect(result).toHaveLength(1);
    expect(result[0]?.memo).toBe('Netflix');
  });

  it('update should throw when recurring transaction does not exist', async () => {
    prisma.recurringTransaction.findFirst.mockResolvedValue(null);

    await expect(
      service.update('workspace-1', 'recurring-1', 'user-1', {
        memo: 'Updated memo',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deactivate should set isActive to false', async () => {
    prisma.recurringTransaction.findFirst.mockResolvedValue({
      id: 'recurring-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('55000.00'),
      currency: 'KRW',
      categoryId: null,
      category: null,
      memo: 'Netflix',
      paidByUserId: 'user-1',
      paidBy: { name: 'Jisu' },
      repeatUnit: RecurringRepeatUnit.MONTHLY,
      repeatInterval: 1,
      dayOfMonth: 25,
      dayOfWeek: null,
      startDate: new Date('2026-03-25T00:00:00.000Z'),
      endDate: null,
      isActive: true,
      createdByUserId: 'user-1',
      createdAt: new Date('2026-03-25T10:00:00.000Z'),
      updatedAt: new Date('2026-03-25T10:00:00.000Z'),
    });
    prisma.recurringTransaction.update.mockResolvedValue({
      id: 'recurring-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('55000.00'),
      currency: 'KRW',
      categoryId: null,
      category: null,
      memo: 'Netflix',
      paidByUserId: 'user-1',
      paidBy: { name: 'Jisu' },
      repeatUnit: RecurringRepeatUnit.MONTHLY,
      repeatInterval: 1,
      dayOfMonth: 25,
      dayOfWeek: null,
      startDate: new Date('2026-03-25T00:00:00.000Z'),
      endDate: null,
      isActive: false,
      createdByUserId: 'user-1',
      createdAt: new Date('2026-03-25T10:00:00.000Z'),
      updatedAt: new Date('2026-03-26T10:00:00.000Z'),
    });

    const result = await service.deactivate(
      'workspace-1',
      'recurring-1',
      'user-1',
    );

    expect(result.isActive).toBe(false);
  });

  it('executeMonthly should create missing occurrences for the month', async () => {
    prisma.recurringTransaction.findMany.mockResolvedValue([
      {
        id: 'recurring-1',
        workspaceId: 'workspace-1',
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: new Prisma.Decimal('55000.00'),
        currency: 'KRW',
        categoryId: null,
        category: null,
        memo: 'Netflix',
        paidByUserId: 'user-1',
        repeatUnit: RecurringRepeatUnit.MONTHLY,
        repeatInterval: 1,
        dayOfMonth: 25,
        dayOfWeek: null,
        startDate: new Date('2026-01-25T00:00:00.000Z'),
        endDate: null,
        isActive: true,
        createdByUserId: 'user-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: 'recurring-2',
        workspaceId: 'workspace-1',
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: new Prisma.Decimal('10000.00'),
        currency: 'KRW',
        categoryId: null,
        category: null,
        memo: 'Gym',
        paidByUserId: 'user-1',
        repeatUnit: RecurringRepeatUnit.WEEKLY,
        repeatInterval: 1,
        dayOfMonth: null,
        dayOfWeek: 2,
        startDate: new Date('2026-03-01T00:00:00.000Z'),
        endDate: null,
        isActive: true,
        createdByUserId: 'user-1',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    ]);
    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.transaction.create
      .mockResolvedValueOnce({
        id: 'transaction-1',
        transactionDate: new Date('2026-03-25T00:00:00.000Z'),
        amount: new Prisma.Decimal('55000.00'),
        memo: 'Netflix',
      })
      .mockResolvedValueOnce({
        id: 'transaction-2',
        transactionDate: new Date('2026-03-03T00:00:00.000Z'),
        amount: new Prisma.Decimal('10000.00'),
        memo: 'Gym',
      })
      .mockResolvedValueOnce({
        id: 'transaction-3',
        transactionDate: new Date('2026-03-10T00:00:00.000Z'),
        amount: new Prisma.Decimal('10000.00'),
        memo: 'Gym',
      })
      .mockResolvedValueOnce({
        id: 'transaction-4',
        transactionDate: new Date('2026-03-17T00:00:00.000Z'),
        amount: new Prisma.Decimal('10000.00'),
        memo: 'Gym',
      })
      .mockResolvedValueOnce({
        id: 'transaction-5',
        transactionDate: new Date('2026-03-24T00:00:00.000Z'),
        amount: new Prisma.Decimal('10000.00'),
        memo: 'Gym',
      })
      .mockResolvedValueOnce({
        id: 'transaction-6',
        transactionDate: new Date('2026-03-31T00:00:00.000Z'),
        amount: new Prisma.Decimal('10000.00'),
        memo: 'Gym',
      });

    const result = await service.executeMonthly('workspace-1', 'user-1', {
      year: 2026,
      month: 3,
    });

    expect(result.summary).toEqual({
      candidateCount: 6,
      createdCount: 6,
      skippedCount: 0,
    });
    expect(prisma.transaction.create).toHaveBeenCalledTimes(6);
  });

  it('executeMonthly should skip duplicates and support dryRun', async () => {
    prisma.recurringTransaction.findMany.mockResolvedValue([
      {
        id: 'recurring-1',
        workspaceId: 'workspace-1',
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: new Prisma.Decimal('55000.00'),
        currency: 'KRW',
        categoryId: null,
        category: null,
        memo: 'Netflix',
        paidByUserId: 'user-1',
        repeatUnit: RecurringRepeatUnit.MONTHLY,
        repeatInterval: 1,
        dayOfMonth: 25,
        dayOfWeek: null,
        startDate: new Date('2026-01-25T00:00:00.000Z'),
        endDate: null,
        isActive: true,
        createdByUserId: 'user-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);
    prisma.transaction.findMany.mockResolvedValue([
      {
        id: 'transaction-1',
        recurringTransactionId: 'recurring-1',
        transactionDate: new Date('2026-03-25T00:00:00.000Z'),
      },
    ]);

    const result = await service.executeMonthly('workspace-1', 'user-1', {
      year: 2026,
      month: 3,
      dryRun: true,
    });

    expect(result.summary).toEqual({
      candidateCount: 1,
      createdCount: 0,
      skippedCount: 1,
    });
    expect(result.items[0]).toMatchObject({
      skipped: true,
      skipReason: 'already_exists',
    });
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it('executeAutomaticDaily should create only occurrences due on the target day', async () => {
    prisma.recurringTransaction.findMany.mockResolvedValue([
      {
        id: 'recurring-1',
        workspaceId: 'workspace-1',
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: new Prisma.Decimal('55000.00'),
        currency: 'KRW',
        categoryId: null,
        category: null,
        memo: 'Netflix',
        paidByUserId: 'user-1',
        repeatUnit: RecurringRepeatUnit.MONTHLY,
        repeatInterval: 1,
        dayOfMonth: 25,
        dayOfWeek: null,
        startDate: new Date('2026-01-25T00:00:00.000Z'),
        endDate: null,
        isActive: true,
        createdByUserId: 'owner-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: 'recurring-2',
        workspaceId: 'workspace-1',
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: new Prisma.Decimal('10000.00'),
        currency: 'KRW',
        categoryId: null,
        category: null,
        memo: 'Gym',
        paidByUserId: 'user-1',
        repeatUnit: RecurringRepeatUnit.WEEKLY,
        repeatInterval: 1,
        dayOfMonth: null,
        dayOfWeek: 2,
        startDate: new Date('2026-03-01T00:00:00.000Z'),
        endDate: null,
        isActive: true,
        createdByUserId: 'owner-2',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    ]);
    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.transaction.create.mockResolvedValue({
      id: 'transaction-1',
      transactionDate: new Date('2026-03-25T00:00:00.000Z'),
      amount: new Prisma.Decimal('55000.00'),
      memo: 'Netflix',
    });

    const result = await service.executeAutomaticDaily(
      'workspace-1',
      new Date('2026-03-25T00:00:00.000Z'),
    );

    expect(result.summary).toEqual({
      candidateCount: 1,
      createdCount: 1,
      skippedCount: 0,
    });
    const createCalls = prisma.transaction.create.mock.calls as Array<
      [
        {
          data: {
            createdByUserId: string;
          };
        },
      ]
    >;

    expect(createCalls[0]?.[0].data.createdByUserId).toBe('owner-1');
  });
});

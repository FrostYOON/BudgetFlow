import { Prisma, RecurringRepeatUnit } from '@budgetflow/database';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    transaction: {
      aggregate: jest.Mock;
      groupBy: jest.Mock;
    };
    budgetMonth: {
      findUnique: jest.Mock;
    };
    recurringTransaction: {
      findMany: jest.Mock;
    };
    category: {
      findMany: jest.Mock;
    };
    user: {
      findMany: jest.Mock;
    };
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
      budgetMonth: {
        findUnique: jest.fn(),
      },
      recurringTransaction: {
        findMany: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
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

    service = module.get<ReportsService>(ReportsService);
  });

  it('getMonthlyReport should return composed report sections', async () => {
    prisma.transaction.aggregate
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('3500000.00') },
      })
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('1250000.00') },
      })
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('980000.00') },
      })
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('270000.00') },
      });
    prisma.transaction.groupBy
      .mockResolvedValueOnce([
        {
          categoryId: 'category-1',
          _sum: { amount: new Prisma.Decimal('420000.00') },
          _count: { id: 12 },
        },
      ])
      .mockResolvedValueOnce([
        {
          paidByUserId: 'user-2',
          _sum: { amount: new Prisma.Decimal('750000.00') },
          _count: { id: 8 },
        },
      ]);
    prisma.budgetMonth.findUnique.mockResolvedValue({
      totalBudgetAmount: new Prisma.Decimal('2000000.00'),
      categoryBudgets: [
        {
          categoryId: 'category-1',
          plannedAmount: new Prisma.Decimal('600000.00'),
          category: { name: 'Groceries' },
        },
      ],
    });
    prisma.recurringTransaction.findMany.mockResolvedValue([
      {
        id: 'recurring-1',
        memo: 'Netflix',
        amount: new Prisma.Decimal('55000.00'),
        category: { name: 'Subscriptions' },
        repeatUnit: RecurringRepeatUnit.MONTHLY,
        repeatInterval: 1,
        dayOfMonth: 25,
        dayOfWeek: null,
        startDate: new Date('2026-01-25T00:00:00.000Z'),
        endDate: null,
      },
    ]);
    prisma.category.findMany.mockResolvedValue([
      {
        id: 'category-1',
        name: 'Groceries',
      },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-2',
        name: 'Jisu',
      },
    ]);

    const result = await service.getMonthlyReport(
      'workspace-1',
      2026,
      3,
      'user-1',
    );

    expect(workspacesService.assertMemberAccess).toHaveBeenCalledWith(
      'workspace-1',
      'user-1',
    );
    expect(result.summary.netAmount).toBe('2250000.00');
    expect(result.categoryBreakdown[0]?.name).toBe('Groceries');
    expect(result.payerBreakdown[0]?.name).toBe('Jisu');
    expect(result.budgetProgress[0]?.progressPct).toBe(70);
    expect(result.recurringUpcoming[0]?.nextOccurrenceDate).toBe('2026-03-25');
  });

  it('getMonthlyReport should return zeroed sections when data is missing', async () => {
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: null },
    });
    prisma.transaction.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.budgetMonth.findUnique.mockResolvedValue(null);
    prisma.recurringTransaction.findMany.mockResolvedValue([]);
    prisma.category.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.getMonthlyReport(
      'workspace-1',
      2026,
      3,
      'user-1',
    );

    expect(result.summary.totalIncome).toBe('0.00');
    expect(result.summary.totalExpense).toBe('0.00');
    expect(result.summary.monthlyBudget).toBe('0.00');
    expect(result.categoryBreakdown).toHaveLength(0);
    expect(result.payerBreakdown).toHaveLength(0);
    expect(result.budgetProgress).toHaveLength(0);
    expect(result.recurringUpcoming).toHaveLength(0);
  });

  it('getMonthlyReport should only include recurring items with an occurrence in the month', async () => {
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: null },
    });
    prisma.transaction.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.budgetMonth.findUnique.mockResolvedValue(null);
    prisma.recurringTransaction.findMany.mockResolvedValue([
      {
        id: 'weekly-1',
        memo: 'Gym',
        amount: new Prisma.Decimal('10000.00'),
        category: null,
        repeatUnit: RecurringRepeatUnit.WEEKLY,
        repeatInterval: 1,
        dayOfMonth: null,
        dayOfWeek: 2,
        startDate: new Date('2026-03-01T00:00:00.000Z'),
        endDate: null,
      },
      {
        id: 'yearly-1',
        memo: 'Insurance',
        amount: new Prisma.Decimal('20000.00'),
        category: null,
        repeatUnit: RecurringRepeatUnit.YEARLY,
        repeatInterval: 1,
        dayOfMonth: null,
        dayOfWeek: null,
        startDate: new Date('2026-10-01T00:00:00.000Z'),
        endDate: null,
      },
    ]);
    prisma.category.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.getMonthlyReport(
      'workspace-1',
      2026,
      3,
      'user-1',
    );

    expect(result.recurringUpcoming).toHaveLength(1);
    expect(result.recurringUpcoming[0]?.id).toBe('weekly-1');
  });
});

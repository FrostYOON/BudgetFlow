import {
  Prisma,
  TransactionType,
  TransactionVisibility,
} from '@budgetflow/database';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    transaction: {
      aggregate: jest.Mock;
      groupBy: jest.Mock;
      findMany: jest.Mock;
    };
    budgetMonth: {
      findUnique: jest.Mock;
    };
    category: {
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
        findMany: jest.fn(),
      },
      budgetMonth: {
        findUnique: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
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

    service = module.get<DashboardService>(DashboardService);
  });

  it('getDashboard should return computed dashboard summary', async () => {
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
    prisma.budgetMonth.findUnique.mockResolvedValue({
      totalBudgetAmount: new Prisma.Decimal('2000000.00'),
      categoryBudgets: [
        {
          plannedAmount: new Prisma.Decimal('600000.00'),
        },
        {
          plannedAmount: new Prisma.Decimal('600000.00'),
        },
      ],
    });
    prisma.transaction.groupBy.mockResolvedValue([
      {
        categoryId: 'category-1',
        _sum: { amount: new Prisma.Decimal('420000.00') },
      },
    ]);
    prisma.transaction.findMany.mockResolvedValue([
      {
        id: 'transaction-1',
        amount: new Prisma.Decimal('52000.00'),
        category: { name: 'Groceries' },
        paidBy: { name: 'Jisu' },
      },
    ]);
    prisma.category.findMany.mockResolvedValue([
      {
        id: 'category-1',
        name: 'Groceries',
      },
    ]);

    const result = await service.getDashboard('workspace-1', 2026, 3, 'user-1');

    expect(workspacesService.assertMemberAccess).toHaveBeenCalledWith(
      'workspace-1',
      'user-1',
    );
    expect(result.summary.totalIncome).toBe('3500000.00');
    expect(result.summary.totalExpense).toBe('1250000.00');
    expect(result.summary.monthlyBudget).toBe('2000000.00');
    expect(result.summary.allocatedBudget).toBe('1200000.00');
    expect(result.summary.unallocatedBudget).toBe('800000.00');
    expect(result.summary.remainingBudget).toBe('750000.00');
    expect(result.topCategories[0]?.name).toBe('Groceries');
    expect(result.recentTransactions[0]?.paidByName).toBe('Jisu');
    expect(result.insights).toEqual([]);
  });

  it('getDashboard should fall back to zero amounts when month budget is missing', async () => {
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: null },
    });
    prisma.budgetMonth.findUnique.mockResolvedValue(null);
    prisma.transaction.groupBy.mockResolvedValue([]);
    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.category.findMany.mockResolvedValue([]);

    const result = await service.getDashboard('workspace-1', 2026, 3, 'user-1');

    expect(result.summary.monthlyBudget).toBe('0.00');
    expect(result.summary.allocatedBudget).toBe('0.00');
    expect(result.summary.unallocatedBudget).toBe('0.00');
    expect(result.topCategories).toHaveLength(0);
    expect(result.recentTransactions).toHaveLength(0);
  });

  it('getDashboard should pass expected aggregate filters', async () => {
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: null },
    });
    prisma.budgetMonth.findUnique.mockResolvedValue(null);
    prisma.transaction.groupBy.mockResolvedValue([]);
    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.category.findMany.mockResolvedValue([]);

    await service.getDashboard('workspace-1', 2026, 3, 'user-1');

    const aggregateCalls = prisma.transaction.aggregate.mock.calls as Array<
      [
        {
          where: {
            workspaceId: string;
            type: TransactionType;
            visibility?: TransactionVisibility;
          };
        },
      ]
    >;

    expect(aggregateCalls[0]?.[0].where).toMatchObject({
      workspaceId: 'workspace-1',
      type: TransactionType.INCOME,
    });
    expect(aggregateCalls[2]?.[0].where).toMatchObject({
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
    });
  });
});

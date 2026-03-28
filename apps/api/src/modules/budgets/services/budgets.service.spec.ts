import { Prisma } from '@budgetflow/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { BudgetsService } from './budgets.service';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let prisma: {
    budgetMonth: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
    };
    category: {
      findMany: jest.Mock;
    };
    budgetCategory: {
      deleteMany: jest.Mock;
      createMany: jest.Mock;
    };
    transaction: {
      groupBy: jest.Mock;
      aggregate: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
  };

  const monthBudgetRecord = {
    id: 'budget-1',
    workspaceId: 'workspace-1',
    year: 2026,
    month: 3,
    totalBudgetAmount: new Prisma.Decimal('2000000.00'),
    categoryBudgets: [
      {
        categoryId: 'category-1',
        plannedAmount: new Prisma.Decimal('600000.00'),
        alertThresholdPct: 80,
        category: {
          name: 'Groceries',
        },
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      budgetMonth: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
      budgetCategory: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      transaction: {
        groupBy: jest.fn(),
        aggregate: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
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

    service = module.get<BudgetsService>(BudgetsService);
  });

  it('upsertMonthlyBudget should create or update a monthly budget and return computed values', async () => {
    prisma.budgetMonth.upsert.mockResolvedValue(monthBudgetRecord);
    prisma.transaction.groupBy.mockResolvedValue([
      {
        categoryId: 'category-1',
        _sum: { amount: new Prisma.Decimal('420000.00') },
      },
    ]);
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: new Prisma.Decimal('420000.00') },
    });

    const result = await service.upsertMonthlyBudget(
      'workspace-1',
      2026,
      3,
      'user-1',
      {
        totalBudgetAmount: '2000000.00',
      },
    );

    expect(result.totalBudgetAmount).toBe('2000000.00');
    expect(result.allocatedAmount).toBe('600000.00');
    expect(result.unallocatedAmount).toBe('1400000.00');
    expect(result.actualAmount).toBe('420000.00');
  });

  it('getMonthlyBudget should throw when the month budget does not exist', async () => {
    prisma.budgetMonth.findUnique.mockResolvedValue(null);

    await expect(
      service.getMonthlyBudget('workspace-1', 2026, 3, 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('replaceCategoryBudgets should reject when allocations exceed the monthly budget', async () => {
    prisma.budgetMonth.findUnique.mockResolvedValue({
      ...monthBudgetRecord,
      categoryBudgets: [],
    });
    prisma.category.findMany.mockResolvedValue([
      {
        id: 'category-1',
        name: 'Groceries',
      },
    ]);

    await expect(
      service.replaceCategoryBudgets('workspace-1', 2026, 3, 'user-1', {
        categories: [
          {
            categoryId: 'category-1',
            plannedAmount: '2500000.00',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('replaceCategoryBudgets should replace category allocations for the month', async () => {
    prisma.budgetMonth.findUnique
      .mockResolvedValueOnce({
        ...monthBudgetRecord,
        categoryBudgets: [],
      })
      .mockResolvedValueOnce(monthBudgetRecord);
    prisma.category.findMany.mockResolvedValue([
      {
        id: 'category-1',
        name: 'Groceries',
      },
    ]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.transaction.groupBy.mockResolvedValue([
      {
        categoryId: 'category-1',
        _sum: { amount: new Prisma.Decimal('420000.00') },
      },
    ]);

    const result = await service.replaceCategoryBudgets(
      'workspace-1',
      2026,
      3,
      'user-1',
      {
        categories: [
          {
            categoryId: 'category-1',
            plannedAmount: '600000.00',
            alertThresholdPct: 80,
          },
        ],
      },
    );

    expect(prisma.budgetCategory.deleteMany).toHaveBeenCalled();
    expect(prisma.budgetCategory.createMany).toHaveBeenCalled();
    expect(result.categories[0]?.actualAmount).toBe('420000.00');
  });

  it('replaceCategoryBudgets should allow clearing all category allocations', async () => {
    prisma.budgetMonth.findUnique
      .mockResolvedValueOnce(monthBudgetRecord)
      .mockResolvedValueOnce({
        ...monthBudgetRecord,
        categoryBudgets: [],
      });
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    prisma.transaction.groupBy.mockResolvedValue([]);

    const result = await service.replaceCategoryBudgets(
      'workspace-1',
      2026,
      3,
      'user-1',
      {
        categories: [],
      },
    );

    expect(prisma.budgetCategory.deleteMany).toHaveBeenCalled();
    expect(prisma.budgetCategory.createMany).not.toHaveBeenCalled();
    expect(result.categories).toHaveLength(0);
    expect(result.allocatedAmount).toBe('0.00');
  });

  it('deleteCategoryBudget should remove one category allocation and return refreshed totals', async () => {
    prisma.budgetMonth.findUnique
      .mockResolvedValueOnce(monthBudgetRecord)
      .mockResolvedValueOnce({
        ...monthBudgetRecord,
        categoryBudgets: [],
      });
    prisma.transaction.groupBy.mockResolvedValue([]);

    const result = await service.deleteCategoryBudget(
      'workspace-1',
      2026,
      3,
      'category-1',
      'user-1',
    );

    expect(prisma.budgetCategory.deleteMany).toHaveBeenCalledWith({
      where: {
        budgetMonthId: 'budget-1',
        categoryId: 'category-1',
      },
    });
    expect(result.categories).toHaveLength(0);
    expect(result.allocatedAmount).toBe('0.00');
  });

  it('replaceCategoryBudgets should reject non-expense categories', async () => {
    prisma.budgetMonth.findUnique.mockResolvedValue({
      ...monthBudgetRecord,
      categoryBudgets: [],
    });
    prisma.category.findMany.mockResolvedValue([]);

    await expect(
      service.replaceCategoryBudgets('workspace-1', 2026, 3, 'user-1', {
        categories: [
          {
            categoryId: 'category-1',
            plannedAmount: '100000.00',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

import { Prisma } from '@budgetflow/database';
import { Test, TestingModule } from '@nestjs/testing';
import { InsightSeverity } from '../../../common/dto/insight-response.dto';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { InsightsService } from './insights.service';

describe('InsightsService', () => {
  let service: InsightsService;
  let prisma: {
    transaction: {
      aggregate: jest.Mock;
      groupBy: jest.Mock;
    };
    budgetMonth: {
      findUnique: jest.Mock;
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
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
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

    service = module.get<InsightsService>(InsightsService);
  });

  it('getMonthlyInsights should return ordered rules for budget and expense spike', async () => {
    prisma.transaction.aggregate
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('2100000.00') },
      })
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('1750000.00') },
      })
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('1500000.00') },
      });
    prisma.budgetMonth.findUnique.mockResolvedValue({
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
    });
    prisma.transaction.groupBy.mockResolvedValue([
      {
        categoryId: 'category-1',
        _sum: {
          amount: new Prisma.Decimal('650000.00'),
        },
      },
    ]);

    const result = await service.getMonthlyInsights(
      'workspace-1',
      2026,
      3,
      'user-1',
    );

    expect(workspacesService.assertMemberAccess).toHaveBeenCalledWith(
      'workspace-1',
      'user-1',
    );
    expect(result.insights).toHaveLength(4);
    expect(result.insights[0]).toMatchObject({
      type: 'CATEGORY_BUDGET_EXCEEDED',
      severity: InsightSeverity.HIGH,
    });
    expect(result.insights[1]).toMatchObject({
      type: 'MONTHLY_BUDGET_EXCEEDED',
      severity: InsightSeverity.HIGH,
    });
    expect(result.insights[2]?.type).toBe('EXPENSE_SPIKE');
    expect(result.insights[3]?.type).toBe('SHARED_SPENDING_HIGH');
  });

  it('listMonthlyInsights should return an empty array when there are no signals', async () => {
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: new Prisma.Decimal('0.00') },
    });
    prisma.budgetMonth.findUnique.mockResolvedValue(null);
    prisma.transaction.groupBy.mockResolvedValue([]);

    const result = await service.listMonthlyInsights('workspace-1', 2026, 3);

    expect(result).toEqual([]);
  });

  it('listMonthlyInsights should honor per-category alert thresholds', async () => {
    prisma.transaction.aggregate
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('450000.00') },
      })
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('100000.00') },
      })
      .mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal('400000.00') },
      });
    prisma.budgetMonth.findUnique.mockResolvedValue({
      totalBudgetAmount: new Prisma.Decimal('1500000.00'),
      categoryBudgets: [
        {
          categoryId: 'category-1',
          plannedAmount: new Prisma.Decimal('500000.00'),
          alertThresholdPct: 90,
          category: {
            name: 'Dining',
          },
        },
      ],
    });
    prisma.transaction.groupBy.mockResolvedValue([
      {
        categoryId: 'category-1',
        _sum: {
          amount: new Prisma.Decimal('460000.00'),
        },
      },
    ]);

    const result = await service.listMonthlyInsights('workspace-1', 2026, 3);

    expect(result).toEqual([
      expect.objectContaining({
        type: 'CATEGORY_BUDGET_WARNING',
        severity: InsightSeverity.MEDIUM,
        title: 'Dining budget reached 92%',
      }),
    ]);
  });
});

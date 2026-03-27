import { Injectable } from '@nestjs/common';
import {
  Prisma,
  TransactionType,
  TransactionVisibility,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';

type DashboardTopCategoryRow = {
  categoryId: string | null;
  _sum: {
    amount: Prisma.Decimal | null;
  };
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async getDashboard(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
  ): Promise<DashboardResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const { start, endExclusive } = this.getMonthRange(year, month);

    const [
      totalIncome,
      totalExpense,
      sharedExpense,
      personalExpense,
      monthBudget,
      topCategoryRows,
      recentTransactions,
    ] = await Promise.all([
      this.aggregateTransactionAmount(workspaceId, start, endExclusive, {
        type: TransactionType.INCOME,
      }),
      this.aggregateTransactionAmount(workspaceId, start, endExclusive, {
        type: TransactionType.EXPENSE,
      }),
      this.aggregateTransactionAmount(workspaceId, start, endExclusive, {
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
      }),
      this.aggregateTransactionAmount(workspaceId, start, endExclusive, {
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.PERSONAL,
      }),
      this.prisma.budgetMonth.findUnique({
        where: {
          workspaceId_year_month: {
            workspaceId,
            year,
            month,
          },
        },
        include: {
          categoryBudgets: true,
        },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          workspaceId,
          isDeleted: false,
          type: TransactionType.EXPENSE,
          transactionDate: {
            gte: start,
            lt: endExclusive,
          },
          categoryId: {
            not: null,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 5,
      }),
      this.prisma.transaction.findMany({
        where: {
          workspaceId,
          isDeleted: false,
          transactionDate: {
            gte: start,
            lt: endExclusive,
          },
        },
        include: {
          category: true,
          paidBy: true,
        },
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
    ]);

    const topCategoryIds = topCategoryRows
      .map((row) => row.categoryId)
      .filter((value): value is string => value !== null);

    const topCategories = topCategoryIds.length
      ? await this.prisma.category.findMany({
          where: {
            id: {
              in: topCategoryIds,
            },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

    const topCategoryMap = new Map(
      topCategories.map((category) => [category.id, category.name]),
    );

    const allocatedBudget = monthBudget
      ? monthBudget.categoryBudgets.reduce(
          (sum, item) => sum.add(item.plannedAmount),
          new Prisma.Decimal(0),
        )
      : new Prisma.Decimal(0);
    const monthlyBudget =
      monthBudget?.totalBudgetAmount ?? new Prisma.Decimal(0);
    const unallocatedBudget = Prisma.Decimal.max(
      monthlyBudget.sub(allocatedBudget),
      new Prisma.Decimal(0),
    );
    const remainingBudget = Prisma.Decimal.max(
      monthlyBudget.sub(totalExpense),
      new Prisma.Decimal(0),
    );

    return {
      period: {
        year,
        month,
      },
      summary: {
        totalIncome: totalIncome.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        sharedExpense: sharedExpense.toFixed(2),
        personalExpense: personalExpense.toFixed(2),
        monthlyBudget: monthlyBudget.toFixed(2),
        allocatedBudget: allocatedBudget.toFixed(2),
        unallocatedBudget: unallocatedBudget.toFixed(2),
        remainingBudget: remainingBudget.toFixed(2),
      },
      topCategories: topCategoryRows
        .filter(
          (row): row is DashboardTopCategoryRow => row.categoryId !== null,
        )
        .map((row) => ({
          categoryId: row.categoryId!,
          name: topCategoryMap.get(row.categoryId!) ?? 'Unknown',
          amount: (row._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
        })),
      recentTransactions: recentTransactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount.toFixed(2),
        categoryName: transaction.category?.name ?? null,
        paidByName: transaction.paidBy?.name ?? null,
      })),
      insights: [],
    };
  }

  private getMonthRange(
    year: number,
    month: number,
  ): {
    start: Date;
    endExclusive: Date;
  } {
    return {
      start: new Date(Date.UTC(year, month - 1, 1)),
      endExclusive: new Date(Date.UTC(year, month, 1)),
    };
  }

  private async aggregateTransactionAmount(
    workspaceId: string,
    start: Date,
    endExclusive: Date,
    filters: {
      type: TransactionType;
      visibility?: TransactionVisibility;
    },
  ): Promise<Prisma.Decimal> {
    const aggregate = await this.prisma.transaction.aggregate({
      where: {
        workspaceId,
        isDeleted: false,
        type: filters.type,
        visibility: filters.visibility,
        transactionDate: {
          gte: start,
          lt: endExclusive,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return aggregate._sum.amount ?? new Prisma.Decimal(0);
  }
}

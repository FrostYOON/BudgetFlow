import { Injectable } from '@nestjs/common';
import {
  Prisma,
  RecurringRepeatUnit,
  TransactionType,
  TransactionVisibility,
} from '@budgetflow/database';
import { getMonthRange } from '../../../common/utils/month-range.util';
import { PrismaService } from '../../../core/database/prisma.service';
import { InsightsService } from '../../insights/services/insights.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { MonthlyReportResponseDto } from '../dto/monthly-report-response.dto';

type CategoryBreakdownRow = {
  categoryId: string | null;
  _sum: { amount: Prisma.Decimal | null };
  _count: { id: number };
};

type PayerBreakdownRow = {
  paidByUserId: string | null;
  _sum: { amount: Prisma.Decimal | null };
  _count: { id: number };
};

type RecurringWithRelations = Prisma.RecurringTransactionGetPayload<{
  include: {
    category: true;
  };
}>;

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
    private readonly insightsService: InsightsService,
  ) {}

  async getMonthlyReport(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
  ): Promise<MonthlyReportResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const { start, endInclusive, endExclusive } = getMonthRange(year, month);

    const [
      totalIncome,
      totalExpense,
      sharedExpense,
      personalExpense,
      categoryRows,
      payerRows,
      monthBudget,
      recurringTransactions,
      insights,
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
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      }),
      this.prisma.transaction.groupBy({
        by: ['paidByUserId'],
        where: {
          workspaceId,
          isDeleted: false,
          type: TransactionType.EXPENSE,
          transactionDate: {
            gte: start,
            lt: endExclusive,
          },
          paidByUserId: {
            not: null,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
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
          categoryBudgets: {
            include: {
              category: true,
            },
            orderBy: {
              category: {
                sortOrder: 'asc',
              },
            },
          },
        },
      }),
      this.prisma.recurringTransaction.findMany({
        where: {
          workspaceId,
          isActive: true,
          startDate: {
            lte: endInclusive,
          },
          OR: [
            {
              endDate: null,
            },
            {
              endDate: {
                gte: start,
              },
            },
          ],
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      this.insightsService.listMonthlyInsights(workspaceId, year, month),
    ]);

    const categoryIds = categoryRows
      .map((row) => row.categoryId)
      .filter((value): value is string => value !== null);
    const payerIds = payerRows
      .map((row) => row.paidByUserId)
      .filter((value): value is string => value !== null);

    const [categories, payers] = await Promise.all([
      categoryIds.length
        ? this.prisma.category.findMany({
            where: {
              id: {
                in: categoryIds,
              },
            },
            select: {
              id: true,
              name: true,
            },
          })
        : [],
      payerIds.length
        ? this.prisma.user.findMany({
            where: {
              id: {
                in: payerIds,
              },
            },
            select: {
              id: true,
              name: true,
            },
          })
        : [],
    ]);

    const categoryMap = new Map(
      categories.map((category) => [category.id, category.name]),
    );
    const payerMap = new Map(payers.map((payer) => [payer.id, payer.name]));

    const monthlyBudget =
      monthBudget?.totalBudgetAmount ?? new Prisma.Decimal(0);
    const remainingBudget = Prisma.Decimal.max(
      monthlyBudget.sub(totalExpense),
      new Prisma.Decimal(0),
    );

    const actualByCategory = new Map<string, Prisma.Decimal>(
      categoryRows
        .filter((row): row is CategoryBreakdownRow => row.categoryId !== null)
        .map((row) => [
          row.categoryId!,
          row._sum.amount ?? new Prisma.Decimal(0),
        ]),
    );

    return {
      year,
      month,
      summary: {
        totalIncome: totalIncome.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        netAmount: totalIncome.sub(totalExpense).toFixed(2),
        sharedExpense: sharedExpense.toFixed(2),
        personalExpense: personalExpense.toFixed(2),
        monthlyBudget: monthlyBudget.toFixed(2),
        remainingBudget: remainingBudget.toFixed(2),
      },
      categoryBreakdown: categoryRows
        .filter((row): row is CategoryBreakdownRow => row.categoryId !== null)
        .map((row) => ({
          categoryId: row.categoryId!,
          name: categoryMap.get(row.categoryId!) ?? 'Unknown',
          amount: (row._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
          transactionCount: row._count.id,
        })),
      payerBreakdown: payerRows
        .filter((row): row is PayerBreakdownRow => row.paidByUserId !== null)
        .map((row) => ({
          userId: row.paidByUserId!,
          name: payerMap.get(row.paidByUserId!) ?? 'Unknown',
          amount: (row._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
          transactionCount: row._count.id,
        })),
      budgetProgress: (monthBudget?.categoryBudgets ?? []).map((item) => {
        const actualAmount =
          actualByCategory.get(item.categoryId) ?? new Prisma.Decimal(0);
        const remainingAmount = Prisma.Decimal.max(
          item.plannedAmount.sub(actualAmount),
          new Prisma.Decimal(0),
        );
        const progressPct = item.plannedAmount.eq(0)
          ? 0
          : Number(
              Prisma.Decimal.min(
                actualAmount.div(item.plannedAmount).mul(100),
                new Prisma.Decimal(999),
              ).toDecimalPlaces(0),
            );

        return {
          categoryId: item.categoryId,
          categoryName: item.category.name,
          plannedAmount: item.plannedAmount.toFixed(2),
          actualAmount: actualAmount.toFixed(2),
          remainingAmount: remainingAmount.toFixed(2),
          progressPct,
        };
      }),
      recurringUpcoming: recurringTransactions
        .map((item) => ({
          item,
          nextOccurrenceDate: this.computeNextOccurrenceInMonth(
            item,
            start,
            endInclusive,
          ),
        }))
        .filter(
          (
            entry,
          ): entry is {
            item: RecurringWithRelations;
            nextOccurrenceDate: Date;
          } => entry.nextOccurrenceDate !== null,
        )
        .sort(
          (a, b) =>
            a.nextOccurrenceDate.getTime() - b.nextOccurrenceDate.getTime(),
        )
        .map(({ item, nextOccurrenceDate }) => ({
          id: item.id,
          memo: item.memo,
          amount: item.amount.toFixed(2),
          categoryName: item.category?.name ?? null,
          nextOccurrenceDate: nextOccurrenceDate.toISOString().slice(0, 10),
        })),
      insights,
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

  private computeNextOccurrenceInMonth(
    item: RecurringWithRelations,
    monthStart: Date,
    monthEndInclusive: Date,
  ): Date | null {
    const startDate = this.stripTime(item.startDate);
    const endDate = item.endDate ? this.stripTime(item.endDate) : null;
    const rangeStart =
      startDate > monthStart ? startDate : this.stripTime(monthStart);
    const rangeEnd =
      endDate && endDate < monthEndInclusive ? endDate : monthEndInclusive;

    if (rangeStart > rangeEnd) {
      return null;
    }

    if (item.repeatUnit === RecurringRepeatUnit.WEEKLY) {
      return this.computeWeeklyOccurrence(item, rangeStart, rangeEnd);
    }

    if (item.repeatUnit === RecurringRepeatUnit.MONTHLY) {
      return this.computeMonthlyOccurrence(item, rangeStart, rangeEnd);
    }

    return this.computeYearlyOccurrence(item, rangeStart, rangeEnd);
  }

  private computeWeeklyOccurrence(
    item: RecurringWithRelations,
    rangeStart: Date,
    rangeEnd: Date,
  ): Date | null {
    const targetDay = item.dayOfWeek;
    if (targetDay === null) {
      return null;
    }

    const candidate = new Date(rangeStart);
    while (candidate <= rangeEnd) {
      if (candidate.getUTCDay() === targetDay) {
        const diffDays = Math.floor(
          (candidate.getTime() - this.stripTime(item.startDate).getTime()) /
            86_400_000,
        );
        const weekIndex = Math.floor(diffDays / 7);
        if (weekIndex >= 0 && weekIndex % item.repeatInterval === 0) {
          return candidate;
        }
      }
      candidate.setUTCDate(candidate.getUTCDate() + 1);
    }

    return null;
  }

  private computeMonthlyOccurrence(
    item: RecurringWithRelations,
    rangeStart: Date,
    rangeEnd: Date,
  ): Date | null {
    const dayOfMonth = item.dayOfMonth;
    if (dayOfMonth === null) {
      return null;
    }

    const candidate = new Date(
      Date.UTC(
        rangeStart.getUTCFullYear(),
        rangeStart.getUTCMonth(),
        Math.min(dayOfMonth, this.daysInMonth(rangeStart)),
      ),
    );

    if (candidate < rangeStart || candidate > rangeEnd) {
      return null;
    }

    const monthDiff =
      (candidate.getUTCFullYear() - item.startDate.getUTCFullYear()) * 12 +
      (candidate.getUTCMonth() - item.startDate.getUTCMonth());

    if (monthDiff < 0 || monthDiff % item.repeatInterval !== 0) {
      return null;
    }

    return candidate;
  }

  private computeYearlyOccurrence(
    item: RecurringWithRelations,
    rangeStart: Date,
    rangeEnd: Date,
  ): Date | null {
    const startDate = this.stripTime(item.startDate);
    const candidate = new Date(
      Date.UTC(
        rangeStart.getUTCFullYear(),
        startDate.getUTCMonth(),
        Math.min(
          startDate.getUTCDate(),
          this.daysInMonth(rangeStart, startDate.getUTCMonth()),
        ),
      ),
    );

    if (candidate < rangeStart || candidate > rangeEnd) {
      return null;
    }

    const yearDiff = candidate.getUTCFullYear() - startDate.getUTCFullYear();
    if (yearDiff < 0 || yearDiff % item.repeatInterval !== 0) {
      return null;
    }

    return candidate;
  }

  private stripTime(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private daysInMonth(date: Date, monthOverride?: number): number {
    const year = date.getUTCFullYear();
    const month =
      monthOverride !== undefined ? monthOverride : date.getUTCMonth();
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  }
}

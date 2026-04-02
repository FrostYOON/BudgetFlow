import { Injectable } from '@nestjs/common';
import {
  Prisma,
  TransactionType,
  TransactionVisibility,
} from '@budgetflow/database';
import {
  InsightResponseDto,
  InsightSeverity,
} from '../../../common/dto/insight-response.dto';
import {
  getMonthRange,
  getPreviousMonthPeriod,
} from '../../../common/utils/month-range.util';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { MonthlyInsightsResponseDto } from '../dto/monthly-insights-response.dto';

type CategoryActualRow = {
  categoryId: string | null;
  _sum: {
    amount: Prisma.Decimal | null;
  };
};

const MONTHLY_BUDGET_WARNING_THRESHOLD = 80;
const EXPENSE_SPIKE_THRESHOLD = 20;
const SHARED_SPENDING_HIGH_THRESHOLD = 80;
const MIN_EXPENSE_SPIKE_DELTA = new Prisma.Decimal(100000);
const MAX_INSIGHTS = 5;

@Injectable()
export class InsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async getMonthlyInsights(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
  ): Promise<MonthlyInsightsResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    return {
      year,
      month,
      insights: await this.listMonthlyInsights(workspaceId, year, month),
    };
  }

  async listMonthlyInsights(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<InsightResponseDto[]> {
    const { start, endExclusive } = getMonthRange(year, month);
    const previousPeriod = getPreviousMonthPeriod(year, month);
    const previousRange = getMonthRange(
      previousPeriod.year,
      previousPeriod.month,
    );

    const [
      totalExpense,
      sharedExpense,
      previousMonthExpense,
      monthBudget,
      actualByCategoryRows,
    ] = await Promise.all([
      this.aggregateExpenseAmount(workspaceId, start, endExclusive),
      this.aggregateExpenseAmount(workspaceId, start, endExclusive, {
        visibility: TransactionVisibility.SHARED,
      }),
      this.aggregateExpenseAmount(
        workspaceId,
        previousRange.start,
        previousRange.endExclusive,
      ),
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
      }),
    ]);

    const insights: InsightResponseDto[] = [];
    const monthlyBudget =
      monthBudget?.totalBudgetAmount ?? new Prisma.Decimal(0);

    if (monthlyBudget.gt(0)) {
      const totalExpensePct = Number(
        totalExpense.div(monthlyBudget).mul(100).toDecimalPlaces(0),
      );

      if (totalExpense.gt(monthlyBudget)) {
        insights.push({
          id: `monthly-budget-exceeded:${year}-${month}`,
          type: 'MONTHLY_BUDGET_EXCEEDED',
          severity: InsightSeverity.HIGH,
          title: 'Monthly budget exceeded',
          body: `Current spending is ${this.formatAmount(totalExpense)} against a monthly budget of ${this.formatAmount(monthlyBudget)}.`,
        });
      } else if (totalExpensePct >= MONTHLY_BUDGET_WARNING_THRESHOLD) {
        insights.push({
          id: `monthly-budget-warning:${year}-${month}`,
          type: 'MONTHLY_BUDGET_WARNING',
          severity: InsightSeverity.MEDIUM,
          title: `Monthly budget reached ${totalExpensePct}%`,
          body: `Current spending is ${this.formatAmount(totalExpense)} out of ${this.formatAmount(monthlyBudget)}.`,
        });
      }
    }

    const actualByCategory = new Map<string, Prisma.Decimal>(
      actualByCategoryRows
        .filter((row): row is CategoryActualRow => row.categoryId !== null)
        .map((row) => [
          row.categoryId!,
          row._sum.amount ?? new Prisma.Decimal(0),
        ]),
    );

    const categoryInsights = (monthBudget?.categoryBudgets ?? [])
      .map((item) => {
        if (item.plannedAmount.lte(0)) {
          return null;
        }

        const actualAmount =
          actualByCategory.get(item.categoryId) ?? new Prisma.Decimal(0);
        const progressPct = Number(
          actualAmount.div(item.plannedAmount).mul(100).toDecimalPlaces(0),
        );
        const threshold =
          item.alertThresholdPct ?? MONTHLY_BUDGET_WARNING_THRESHOLD;

        if (actualAmount.gt(item.plannedAmount)) {
          return {
            id: `category-budget-exceeded:${item.categoryId}:${year}-${month}`,
            type: 'CATEGORY_BUDGET_EXCEEDED',
            severity: InsightSeverity.HIGH,
            title: `${item.category.name} budget exceeded`,
            body: `${item.category.name} spent ${this.formatAmount(actualAmount)} against a planned budget of ${this.formatAmount(item.plannedAmount)}.`,
            rankAmount: actualAmount.sub(item.plannedAmount),
          };
        }

        if (progressPct >= threshold) {
          return {
            id: `category-budget-warning:${item.categoryId}:${year}-${month}`,
            type: 'CATEGORY_BUDGET_WARNING',
            severity: InsightSeverity.MEDIUM,
            title: `${item.category.name} budget reached ${progressPct}%`,
            body: `${item.category.name} spent ${this.formatAmount(actualAmount)} out of ${this.formatAmount(item.plannedAmount)}.`,
            rankAmount: actualAmount,
          };
        }

        return null;
      })
      .filter(
        (
          insight,
        ): insight is InsightResponseDto & {
          rankAmount: Prisma.Decimal;
        } => insight !== null,
      )
      .sort((a, b) => b.rankAmount.comparedTo(a.rankAmount))
      .slice(0, 2)
      .map((insight) => ({
        id: insight.id,
        type: insight.type,
        severity: insight.severity,
        title: insight.title,
        body: insight.body,
      }));

    insights.push(...categoryInsights);

    if (
      previousMonthExpense.gt(0) &&
      totalExpense.gt(previousMonthExpense) &&
      totalExpense.sub(previousMonthExpense).gte(MIN_EXPENSE_SPIKE_DELTA)
    ) {
      const changePct = Number(
        totalExpense
          .sub(previousMonthExpense)
          .div(previousMonthExpense)
          .mul(100)
          .toDecimalPlaces(0),
      );

      if (changePct >= EXPENSE_SPIKE_THRESHOLD) {
        insights.push({
          id: `expense-spike:${year}-${month}`,
          type: 'EXPENSE_SPIKE',
          severity: InsightSeverity.MEDIUM,
          title: `Expenses increased ${changePct}% from last month`,
          body: `This month spent ${this.formatAmount(totalExpense)} compared with ${this.formatAmount(previousMonthExpense)} last month.`,
        });
      }
    }

    if (totalExpense.gt(0)) {
      const sharedPct = Number(
        sharedExpense.div(totalExpense).mul(100).toDecimalPlaces(0),
      );

      if (sharedPct >= SHARED_SPENDING_HIGH_THRESHOLD) {
        insights.push({
          id: `shared-spending-high:${year}-${month}`,
          type: 'SHARED_SPENDING_HIGH',
          severity: InsightSeverity.LOW,
          title: `Shared spending accounts for ${sharedPct}% of expenses`,
          body: `${this.formatAmount(sharedExpense)} of ${this.formatAmount(totalExpense)} total expense was shared.`,
        });
      }
    }

    return insights
      .sort((a, b) => {
        const severityOrder =
          this.getSeverityRank(b.severity) - this.getSeverityRank(a.severity);

        if (severityOrder !== 0) {
          return severityOrder;
        }

        return a.title.localeCompare(b.title);
      })
      .slice(0, MAX_INSIGHTS);
  }

  private async aggregateExpenseAmount(
    workspaceId: string,
    start: Date,
    endExclusive: Date,
    filters?: {
      visibility?: TransactionVisibility;
    },
  ): Promise<Prisma.Decimal> {
    const aggregate = await this.prisma.transaction.aggregate({
      where: {
        workspaceId,
        isDeleted: false,
        type: TransactionType.EXPENSE,
        visibility: filters?.visibility,
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

  private formatAmount(amount: Prisma.Decimal): string {
    return `${amount.toFixed(2)} KRW`;
  }

  private getSeverityRank(severity: InsightSeverity): number {
    switch (severity) {
      case InsightSeverity.HIGH:
        return 3;
      case InsightSeverity.MEDIUM:
        return 2;
      case InsightSeverity.LOW:
        return 1;
      default:
        return 0;
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryType, Prisma, TransactionType } from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { CategoryBudgetListResponseDto } from '../dto/category-budget-list-response.dto';
import { CategoryBudgetResponseDto } from '../dto/category-budget-response.dto';
import { MonthlyBudgetResponseDto } from '../dto/monthly-budget-response.dto';
import {
  CategoryBudgetInputDto,
  UpsertCategoryBudgetsRequestDto,
} from '../dto/upsert-category-budgets-request.dto';
import { UpsertMonthlyBudgetRequestDto } from '../dto/upsert-monthly-budget-request.dto';

type BudgetMonthWithCategories = Prisma.BudgetMonthGetPayload<{
  include: {
    categoryBudgets: {
      include: {
        category: true;
      };
    };
  };
}>;

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async upsertMonthlyBudget(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
    input: UpsertMonthlyBudgetRequestDto,
  ): Promise<MonthlyBudgetResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    this.assertValidPeriod(year, month);

    const monthBudget = await this.prisma.budgetMonth.upsert({
      where: {
        workspaceId_year_month: {
          workspaceId,
          year,
          month,
        },
      },
      update: {
        totalBudgetAmount: new Prisma.Decimal(input.totalBudgetAmount),
      },
      create: {
        workspaceId,
        year,
        month,
        totalBudgetAmount: new Prisma.Decimal(input.totalBudgetAmount),
        createdByUserId: userId,
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
    });

    return this.buildMonthlyBudgetResponse(monthBudget);
  }

  async getMonthlyBudget(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
  ): Promise<MonthlyBudgetResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    this.assertValidPeriod(year, month);

    const monthBudget = await this.findBudgetMonthOrThrow(
      workspaceId,
      year,
      month,
    );
    return this.buildMonthlyBudgetResponse(monthBudget);
  }

  async replaceCategoryBudgets(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
    input: UpsertCategoryBudgetsRequestDto,
  ): Promise<CategoryBudgetListResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    this.assertValidPeriod(year, month);
    this.assertUniqueCategoryIds(input.categories);

    const monthBudget = await this.findBudgetMonthOrThrow(
      workspaceId,
      year,
      month,
    );
    const validatedCategories = await this.loadExpenseCategories(
      workspaceId,
      input.categories,
    );

    const totalPlanned = input.categories.reduce(
      (sum, item) => sum.add(new Prisma.Decimal(item.plannedAmount)),
      new Prisma.Decimal(0),
    );

    if (
      totalPlanned.gt(monthBudget.totalBudgetAmount ?? new Prisma.Decimal(0))
    ) {
      throw new BadRequestException(
        'Category budget total exceeds monthly budget.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.budgetCategory.deleteMany({
        where: {
          budgetMonthId: monthBudget.id,
        },
      });

      if (input.categories.length > 0) {
        await tx.budgetCategory.createMany({
          data: input.categories.map((item) => ({
            budgetMonthId: monthBudget.id,
            categoryId: item.categoryId,
            plannedAmount: new Prisma.Decimal(item.plannedAmount),
            alertThresholdPct: item.alertThresholdPct ?? null,
          })),
        });
      }
    });

    const refreshed = await this.findBudgetMonthOrThrow(
      workspaceId,
      year,
      month,
    );
    const actualMap = await this.loadActualExpenseByCategory(
      workspaceId,
      year,
      month,
    );

    return this.buildCategoryBudgetListResponse(
      refreshed,
      validatedCategories,
      actualMap,
    );
  }

  async deleteCategoryBudget(
    workspaceId: string,
    year: number,
    month: number,
    categoryId: string,
    userId: string,
  ): Promise<CategoryBudgetListResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    this.assertValidPeriod(year, month);

    const monthBudget = await this.findBudgetMonthOrThrow(
      workspaceId,
      year,
      month,
    );

    await this.prisma.budgetCategory.deleteMany({
      where: {
        budgetMonthId: monthBudget.id,
        categoryId,
      },
    });

    const refreshed = await this.findBudgetMonthOrThrow(
      workspaceId,
      year,
      month,
    );
    const actualMap = await this.loadActualExpenseByCategory(
      workspaceId,
      year,
      month,
    );

    return this.buildCategoryBudgetListResponse(refreshed, null, actualMap);
  }

  private assertValidPeriod(year: number, month: number): void {
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('year must be between 2000 and 2100.');
    }

    if (month < 1 || month > 12) {
      throw new BadRequestException('month must be between 1 and 12.');
    }
  }

  private assertUniqueCategoryIds(categories: CategoryBudgetInputDto[]): void {
    const ids = categories.map((item) => item.categoryId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException(
        'Each category can only appear once in the category budget payload.',
      );
    }
  }

  private async findBudgetMonthOrThrow(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<BudgetMonthWithCategories> {
    const monthBudget = await this.prisma.budgetMonth.findUnique({
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
    });

    if (!monthBudget) {
      throw new NotFoundException('Monthly budget was not found.');
    }

    return monthBudget;
  }

  private async loadExpenseCategories(
    workspaceId: string,
    items: CategoryBudgetInputDto[],
  ): Promise<Map<string, { id: string; name: string }>> {
    if (items.length === 0) {
      return new Map();
    }

    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: items.map((item) => item.categoryId),
        },
        workspaceId,
        isArchived: false,
        type: CategoryType.EXPENSE,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (categories.length !== items.length) {
      throw new BadRequestException(
        'All category budgets must reference active expense categories in the workspace.',
      );
    }

    return new Map(categories.map((category) => [category.id, category]));
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

  private async loadActualExpenseByCategory(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<Map<string, Prisma.Decimal>> {
    const { start, endExclusive } = this.getMonthRange(year, month);

    const rows = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        workspaceId,
        isDeleted: false,
        type: TransactionType.EXPENSE,
        transactionDate: {
          gte: start,
          lt: endExclusive,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return rows.reduce((map, row) => {
      if (!row.categoryId) {
        return map;
      }

      map.set(row.categoryId, row._sum.amount ?? new Prisma.Decimal(0));
      return map;
    }, new Map<string, Prisma.Decimal>());
  }

  private async loadActualExpenseTotal(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<Prisma.Decimal> {
    const { start, endExclusive } = this.getMonthRange(year, month);

    const aggregate = await this.prisma.transaction.aggregate({
      where: {
        workspaceId,
        isDeleted: false,
        type: TransactionType.EXPENSE,
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

  private buildCategoryBudgetResponse(
    categoryBudget: BudgetMonthWithCategories['categoryBudgets'][number],
    actualAmount: Prisma.Decimal,
  ): CategoryBudgetResponseDto {
    const plannedAmount = categoryBudget.plannedAmount;
    const remainingAmount = Prisma.Decimal.max(
      plannedAmount.sub(actualAmount),
      new Prisma.Decimal(0),
    );
    const progressPct = plannedAmount.eq(0)
      ? 0
      : Number(
          Prisma.Decimal.min(
            actualAmount.div(plannedAmount).mul(100),
            new Prisma.Decimal(999),
          ).toDecimalPlaces(0),
        );

    return {
      categoryId: categoryBudget.categoryId,
      categoryName: categoryBudget.category.name,
      plannedAmount: plannedAmount.toFixed(2),
      actualAmount: actualAmount.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2),
      progressPct,
      alertThresholdPct: categoryBudget.alertThresholdPct,
    };
  }

  private buildCategoryBudgetListResponse(
    monthBudget: BudgetMonthWithCategories,
    validatedCategories: Map<string, { id: string; name: string }> | null,
    actualMap: Map<string, Prisma.Decimal>,
  ): CategoryBudgetListResponseDto {
    const categories = monthBudget.categoryBudgets.map((categoryBudget) => {
      const actualAmount =
        actualMap.get(categoryBudget.categoryId) ?? new Prisma.Decimal(0);

      if (validatedCategories) {
        const category = validatedCategories.get(categoryBudget.categoryId);
        if (category) {
          categoryBudget.category.name = category.name;
        }
      }

      return this.buildCategoryBudgetResponse(categoryBudget, actualAmount);
    });

    const allocatedAmount = monthBudget.categoryBudgets.reduce(
      (sum, item) => sum.add(item.plannedAmount),
      new Prisma.Decimal(0),
    );
    const totalBudgetAmount =
      monthBudget.totalBudgetAmount ?? new Prisma.Decimal(0);
    const unallocatedAmount = Prisma.Decimal.max(
      totalBudgetAmount.sub(allocatedAmount),
      new Prisma.Decimal(0),
    );

    return {
      categories,
      allocatedAmount: allocatedAmount.toFixed(2),
      unallocatedAmount: unallocatedAmount.toFixed(2),
    };
  }

  private async buildMonthlyBudgetResponse(
    monthBudget: BudgetMonthWithCategories,
  ): Promise<MonthlyBudgetResponseDto> {
    const [actualMap, actualAmount] = await Promise.all([
      this.loadActualExpenseByCategory(
        monthBudget.workspaceId,
        monthBudget.year,
        monthBudget.month,
      ),
      this.loadActualExpenseTotal(
        monthBudget.workspaceId,
        monthBudget.year,
        monthBudget.month,
      ),
    ]);

    const categoryBudgetList = this.buildCategoryBudgetListResponse(
      monthBudget,
      null,
      actualMap,
    );

    return {
      id: monthBudget.id,
      workspaceId: monthBudget.workspaceId,
      year: monthBudget.year,
      month: monthBudget.month,
      totalBudgetAmount: (
        monthBudget.totalBudgetAmount ?? new Prisma.Decimal(0)
      ).toFixed(2),
      allocatedAmount: categoryBudgetList.allocatedAmount,
      unallocatedAmount: categoryBudgetList.unallocatedAmount,
      actualAmount: actualAmount.toFixed(2),
      categories: categoryBudgetList.categories,
    };
  }
}

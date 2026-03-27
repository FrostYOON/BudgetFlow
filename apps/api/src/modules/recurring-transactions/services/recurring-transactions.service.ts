import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  RecurringRepeatUnit,
  RecurringTransaction,
  Transaction,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { getMonthRange } from '../../../common/utils/month-range.util';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { CreateRecurringTransactionRequestDto } from '../dto/create-recurring-transaction-request.dto';
import { ExecuteRecurringTransactionsRequestDto } from '../dto/execute-recurring-transactions-request.dto';
import {
  ExecuteRecurringTransactionsResponseDto,
  ExecutedRecurringTransactionItemDto,
} from '../dto/execute-recurring-transactions-response.dto';
import { ListRecurringTransactionsQueryDto } from '../dto/list-recurring-transactions-query.dto';
import { RecurringTransactionResponseDto } from '../dto/recurring-transaction-response.dto';
import { UpdateRecurringTransactionRequestDto } from '../dto/update-recurring-transaction-request.dto';

type RecurringTransactionWithRelations = Prisma.RecurringTransactionGetPayload<{
  include: {
    category: true;
    paidBy: true;
  };
}>;

type RecurringTransactionForExecution = Prisma.RecurringTransactionGetPayload<{
  include: {
    category: true;
  };
}>;

@Injectable()
export class RecurringTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    input: CreateRecurringTransactionRequestDto,
  ): Promise<RecurringTransactionResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const paidByUserId = input.paidByUserId ?? userId;
    await this.assertValidPaidBy(workspaceId, paidByUserId);
    await this.assertValidCategory(workspaceId, input.categoryId, input.type);
    this.assertRepeatRule(input);
    this.assertDateRange(input.startDate, input.endDate);

    const recurringTransaction = await this.prisma.recurringTransaction.create({
      data: {
        workspaceId,
        type: input.type,
        visibility: input.visibility,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency,
        categoryId: input.categoryId ?? null,
        memo: input.memo ?? null,
        paidByUserId,
        repeatUnit: input.repeatUnit,
        repeatInterval: input.repeatInterval,
        dayOfMonth: input.dayOfMonth ?? null,
        dayOfWeek: input.dayOfWeek ?? null,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        createdByUserId: userId,
      },
      include: {
        category: true,
        paidBy: true,
      },
    });

    return this.toResponse(recurringTransaction);
  }

  async list(
    workspaceId: string,
    userId: string,
    query: ListRecurringTransactionsQueryDto,
  ): Promise<RecurringTransactionResponseDto[]> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const items = await this.prisma.recurringTransaction.findMany({
      where: {
        workspaceId,
        type: query.type,
        visibility: query.visibility,
        repeatUnit: query.repeatUnit,
        ...(query.includeInactive ? {} : { isActive: true }),
      },
      include: {
        category: true,
        paidBy: true,
      },
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    });

    return items.map((item) => this.toResponse(item));
  }

  async update(
    workspaceId: string,
    recurringTransactionId: string,
    userId: string,
    input: UpdateRecurringTransactionRequestDto,
  ): Promise<RecurringTransactionResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const existing = await this.findRecurringTransactionOrThrow(
      workspaceId,
      recurringTransactionId,
    );

    const nextState = {
      type: input.type ?? existing.type,
      visibility: input.visibility ?? existing.visibility,
      amount: input.amount ?? existing.amount.toFixed(2),
      currency: input.currency ?? existing.currency,
      categoryId:
        input.categoryId !== undefined ? input.categoryId : existing.categoryId,
      memo: input.memo !== undefined ? input.memo : existing.memo,
      paidByUserId:
        input.paidByUserId !== undefined
          ? input.paidByUserId
          : existing.paidByUserId,
      repeatUnit: input.repeatUnit ?? existing.repeatUnit,
      repeatInterval: input.repeatInterval ?? existing.repeatInterval,
      dayOfMonth:
        input.dayOfMonth !== undefined ? input.dayOfMonth : existing.dayOfMonth,
      dayOfWeek:
        input.dayOfWeek !== undefined ? input.dayOfWeek : existing.dayOfWeek,
      startDate:
        input.startDate !== undefined
          ? input.startDate
          : existing.startDate.toISOString().slice(0, 10),
      endDate:
        input.endDate !== undefined
          ? input.endDate
          : existing.endDate?.toISOString().slice(0, 10),
      isActive: input.isActive ?? existing.isActive,
    };

    if (nextState.paidByUserId) {
      await this.assertValidPaidBy(workspaceId, nextState.paidByUserId);
    }

    await this.assertValidCategory(
      workspaceId,
      nextState.categoryId ?? undefined,
      nextState.type,
    );
    this.assertRepeatRule(nextState);
    this.assertDateRange(nextState.startDate, nextState.endDate);

    const recurringTransaction = await this.prisma.recurringTransaction.update({
      where: {
        id: recurringTransactionId,
      },
      data: {
        type: nextState.type,
        visibility: nextState.visibility,
        amount: new Prisma.Decimal(nextState.amount),
        currency: nextState.currency,
        categoryId: nextState.categoryId ?? null,
        memo: nextState.memo ?? null,
        paidByUserId: nextState.paidByUserId ?? null,
        repeatUnit: nextState.repeatUnit,
        repeatInterval: nextState.repeatInterval,
        dayOfMonth: nextState.dayOfMonth ?? null,
        dayOfWeek: nextState.dayOfWeek ?? null,
        startDate: new Date(nextState.startDate),
        endDate: nextState.endDate ? new Date(nextState.endDate) : null,
        isActive: nextState.isActive,
      },
      include: {
        category: true,
        paidBy: true,
      },
    });

    return this.toResponse(recurringTransaction);
  }

  async executeMonthly(
    workspaceId: string,
    userId: string,
    input: ExecuteRecurringTransactionsRequestDto,
  ): Promise<ExecuteRecurringTransactionsResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const { start, endInclusive, endExclusive } = getMonthRange(
      input.year,
      input.month,
    );
    const dryRun = input.dryRun ?? false;

    const recurringTransactions =
      await this.prisma.recurringTransaction.findMany({
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
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });

    const candidateOccurrences = recurringTransactions.flatMap((item) =>
      this.computeOccurrenceDatesInMonth(item, start, endInclusive).map(
        (transactionDate) => ({
          recurringTransaction: item,
          transactionDate,
        }),
      ),
    );

    if (!candidateOccurrences.length) {
      return {
        year: input.year,
        month: input.month,
        dryRun,
        summary: {
          candidateCount: 0,
          createdCount: 0,
          skippedCount: 0,
        },
        items: [],
      };
    }

    const existingTransactions = await this.prisma.transaction.findMany({
      where: {
        workspaceId,
        recurringTransactionId: {
          in: [
            ...new Set(
              candidateOccurrences.map((item) => item.recurringTransaction.id),
            ),
          ],
        },
        transactionDate: {
          gte: start,
          lt: endExclusive,
        },
      },
      select: {
        id: true,
        recurringTransactionId: true,
        transactionDate: true,
      },
    });

    const existingKeys = new Set(
      existingTransactions.map((transaction) =>
        this.toOccurrenceKey(
          transaction.recurringTransactionId!,
          transaction.transactionDate,
        ),
      ),
    );

    const items: ExecutedRecurringTransactionItemDto[] = [];

    for (const occurrence of candidateOccurrences) {
      const occurrenceKey = this.toOccurrenceKey(
        occurrence.recurringTransaction.id,
        occurrence.transactionDate,
      );

      if (existingKeys.has(occurrenceKey)) {
        items.push({
          recurringTransactionId: occurrence.recurringTransaction.id,
          transactionId: null,
          transactionDate: this.toDateString(occurrence.transactionDate),
          memo: occurrence.recurringTransaction.memo,
          amount: occurrence.recurringTransaction.amount.toFixed(2),
          skipped: true,
          skipReason: 'already_exists',
        });
        continue;
      }

      if (dryRun) {
        items.push({
          recurringTransactionId: occurrence.recurringTransaction.id,
          transactionId: null,
          transactionDate: this.toDateString(occurrence.transactionDate),
          memo: occurrence.recurringTransaction.memo,
          amount: occurrence.recurringTransaction.amount.toFixed(2),
          skipped: false,
          skipReason: null,
        });
        continue;
      }

      const transaction = await this.createGeneratedTransaction(
        occurrence.recurringTransaction,
        occurrence.transactionDate,
        userId,
      );

      existingKeys.add(occurrenceKey);
      items.push({
        recurringTransactionId: occurrence.recurringTransaction.id,
        transactionId: transaction.id,
        transactionDate: this.toDateString(transaction.transactionDate),
        memo: transaction.memo,
        amount: transaction.amount.toFixed(2),
        skipped: false,
        skipReason: null,
      });
    }

    return {
      year: input.year,
      month: input.month,
      dryRun,
      summary: {
        candidateCount: items.length,
        createdCount: items.filter((item) => !item.skipped).length,
        skippedCount: items.filter((item) => item.skipped).length,
      },
      items,
    };
  }

  async deactivate(
    workspaceId: string,
    recurringTransactionId: string,
    userId: string,
  ): Promise<RecurringTransactionResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    await this.findRecurringTransactionOrThrow(
      workspaceId,
      recurringTransactionId,
    );

    const recurringTransaction = await this.prisma.recurringTransaction.update({
      where: {
        id: recurringTransactionId,
      },
      data: {
        isActive: false,
      },
      include: {
        category: true,
        paidBy: true,
      },
    });

    return this.toResponse(recurringTransaction);
  }

  private async findRecurringTransactionOrThrow(
    workspaceId: string,
    recurringTransactionId: string,
  ): Promise<RecurringTransactionWithRelations> {
    const recurringTransaction =
      await this.prisma.recurringTransaction.findFirst({
        where: {
          id: recurringTransactionId,
          workspaceId,
        },
        include: {
          category: true,
          paidBy: true,
        },
      });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction was not found.');
    }

    return recurringTransaction;
  }

  private async assertValidPaidBy(
    workspaceId: string,
    paidByUserId: string,
  ): Promise<void> {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: paidByUserId,
        },
      },
    });

    if (!membership || membership.status !== WorkspaceMemberStatus.ACTIVE) {
      throw new BadRequestException(
        'paidByUserId must be an active member of the workspace.',
      );
    }
  }

  private async assertValidCategory(
    workspaceId: string,
    categoryId: string | undefined,
    type: RecurringTransaction['type'],
  ): Promise<void> {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        workspaceId,
        isArchived: false,
      },
    });

    if (!category) {
      throw new BadRequestException(
        'categoryId must reference an active category in this workspace.',
      );
    }

    if (category.type !== type) {
      throw new BadRequestException(
        'Transaction type must match the selected category type.',
      );
    }
  }

  private assertRepeatRule(input: {
    repeatUnit: RecurringRepeatUnit;
    dayOfMonth?: number | null;
    dayOfWeek?: number | null;
    repeatInterval: number;
  }): void {
    if (input.repeatInterval < 1) {
      throw new BadRequestException('repeatInterval must be at least 1.');
    }

    if (input.repeatUnit === RecurringRepeatUnit.WEEKLY) {
      if (input.dayOfWeek === undefined || input.dayOfWeek === null) {
        throw new BadRequestException(
          'dayOfWeek is required for weekly recurring transactions.',
        );
      }

      if (input.dayOfMonth !== undefined && input.dayOfMonth !== null) {
        throw new BadRequestException(
          'dayOfMonth must not be set for weekly recurring transactions.',
        );
      }

      return;
    }

    if (input.repeatUnit === RecurringRepeatUnit.MONTHLY) {
      if (input.dayOfMonth === undefined || input.dayOfMonth === null) {
        throw new BadRequestException(
          'dayOfMonth is required for monthly recurring transactions.',
        );
      }

      if (input.dayOfWeek !== undefined && input.dayOfWeek !== null) {
        throw new BadRequestException(
          'dayOfWeek must not be set for monthly recurring transactions.',
        );
      }

      return;
    }

    if (input.dayOfMonth !== undefined && input.dayOfMonth !== null) {
      throw new BadRequestException(
        'dayOfMonth is not supported for yearly recurring transactions.',
      );
    }

    if (input.dayOfWeek !== undefined && input.dayOfWeek !== null) {
      throw new BadRequestException(
        'dayOfWeek is not supported for yearly recurring transactions.',
      );
    }
  }

  private assertDateRange(startDate: string, endDate?: string | null): void {
    if (!endDate) {
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('endDate must be on or after startDate.');
    }
  }

  private toResponse(
    recurringTransaction: RecurringTransactionWithRelations,
  ): RecurringTransactionResponseDto {
    return {
      id: recurringTransaction.id,
      workspaceId: recurringTransaction.workspaceId,
      type: recurringTransaction.type,
      visibility: recurringTransaction.visibility,
      amount: recurringTransaction.amount.toFixed(2),
      currency: recurringTransaction.currency,
      categoryId: recurringTransaction.categoryId,
      categoryName: recurringTransaction.category?.name ?? null,
      memo: recurringTransaction.memo,
      paidByUserId: recurringTransaction.paidByUserId,
      paidByUserName: recurringTransaction.paidBy?.name ?? null,
      repeatUnit: recurringTransaction.repeatUnit,
      repeatInterval: recurringTransaction.repeatInterval,
      dayOfMonth: recurringTransaction.dayOfMonth,
      dayOfWeek: recurringTransaction.dayOfWeek,
      startDate: recurringTransaction.startDate.toISOString().slice(0, 10),
      endDate: recurringTransaction.endDate
        ? recurringTransaction.endDate.toISOString().slice(0, 10)
        : null,
      isActive: recurringTransaction.isActive,
      createdByUserId: recurringTransaction.createdByUserId,
      createdAt: recurringTransaction.createdAt.toISOString(),
      updatedAt: recurringTransaction.updatedAt.toISOString(),
    };
  }

  private async createGeneratedTransaction(
    recurringTransaction: RecurringTransactionForExecution,
    transactionDate: Date,
    createdByUserId: string,
  ): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        workspaceId: recurringTransaction.workspaceId,
        categoryId: recurringTransaction.categoryId ?? null,
        type: recurringTransaction.type,
        visibility: recurringTransaction.visibility,
        amount: recurringTransaction.amount,
        currency: recurringTransaction.currency,
        transactionDate,
        memo: recurringTransaction.memo,
        createdByUserId,
        paidByUserId: recurringTransaction.paidByUserId ?? null,
        recurringTransactionId: recurringTransaction.id,
      },
    });
  }

  private computeOccurrenceDatesInMonth(
    recurringTransaction: RecurringTransactionForExecution,
    monthStart: Date,
    monthEndInclusive: Date,
  ): Date[] {
    const startDate = this.stripTime(recurringTransaction.startDate);
    const endDate = recurringTransaction.endDate
      ? this.stripTime(recurringTransaction.endDate)
      : null;
    const rangeStart =
      startDate > monthStart ? startDate : this.stripTime(monthStart);
    const rangeEnd =
      endDate && endDate < monthEndInclusive ? endDate : monthEndInclusive;

    if (rangeStart > rangeEnd) {
      return [];
    }

    switch (recurringTransaction.repeatUnit) {
      case RecurringRepeatUnit.WEEKLY:
        return this.computeWeeklyOccurrences(
          recurringTransaction,
          rangeStart,
          rangeEnd,
        );
      case RecurringRepeatUnit.MONTHLY:
        return this.computeMonthlyOccurrences(
          recurringTransaction,
          rangeStart,
          rangeEnd,
        );
      case RecurringRepeatUnit.YEARLY:
        return this.computeYearlyOccurrences(
          recurringTransaction,
          rangeStart,
          rangeEnd,
        );
      default:
        return [];
    }
  }

  private computeWeeklyOccurrences(
    recurringTransaction: RecurringTransactionForExecution,
    rangeStart: Date,
    rangeEnd: Date,
  ): Date[] {
    if (recurringTransaction.dayOfWeek === null) {
      return [];
    }

    const dates: Date[] = [];
    const candidate = new Date(rangeStart);

    while (candidate <= rangeEnd) {
      if (candidate.getUTCDay() === recurringTransaction.dayOfWeek) {
        const diffDays = Math.floor(
          (candidate.getTime() -
            this.stripTime(recurringTransaction.startDate).getTime()) /
            86_400_000,
        );
        const weekIndex = Math.floor(diffDays / 7);

        if (
          weekIndex >= 0 &&
          weekIndex % recurringTransaction.repeatInterval === 0
        ) {
          dates.push(new Date(candidate));
        }
      }

      candidate.setUTCDate(candidate.getUTCDate() + 1);
    }

    return dates;
  }

  private computeMonthlyOccurrences(
    recurringTransaction: RecurringTransactionForExecution,
    rangeStart: Date,
    rangeEnd: Date,
  ): Date[] {
    if (recurringTransaction.dayOfMonth === null) {
      return [];
    }

    const candidate = new Date(
      Date.UTC(
        rangeStart.getUTCFullYear(),
        rangeStart.getUTCMonth(),
        Math.min(recurringTransaction.dayOfMonth, this.daysInMonth(rangeStart)),
      ),
    );

    if (candidate < rangeStart || candidate > rangeEnd) {
      return [];
    }

    const monthDiff =
      (candidate.getUTCFullYear() -
        recurringTransaction.startDate.getUTCFullYear()) *
        12 +
      (candidate.getUTCMonth() - recurringTransaction.startDate.getUTCMonth());

    if (
      monthDiff < 0 ||
      monthDiff % recurringTransaction.repeatInterval !== 0
    ) {
      return [];
    }

    return [candidate];
  }

  private computeYearlyOccurrences(
    recurringTransaction: RecurringTransactionForExecution,
    rangeStart: Date,
    rangeEnd: Date,
  ): Date[] {
    const startDate = this.stripTime(recurringTransaction.startDate);
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
      return [];
    }

    const yearDiff = candidate.getUTCFullYear() - startDate.getUTCFullYear();
    if (yearDiff < 0 || yearDiff % recurringTransaction.repeatInterval !== 0) {
      return [];
    }

    return [candidate];
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

  private toOccurrenceKey(
    recurringTransactionId: string,
    transactionDate: Date,
  ): string {
    return `${recurringTransactionId}:${this.toDateString(transactionDate)}`;
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}

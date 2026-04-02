import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ShareType,
  TransactionVisibility,
  TransactionType,
} from '@budgetflow/database';
import { getMonthRange } from '../../../common/utils/month-range.util';
import { PrismaService } from '../../../core/database/prisma.service';
import { InsightsService } from '../../insights/services/insights.service';
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
    private readonly insightsService: InsightsService,
  ) {}

  async getDashboard(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
  ): Promise<DashboardResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const { start, endExclusive } = getMonthRange(year, month);

    const [
      totalIncome,
      totalExpense,
      sharedExpense,
      personalExpense,
      monthBudget,
      topCategoryRows,
      recentTransactions,
      insights,
      members,
      sharedTransactions,
      settlementTransfers,
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
      this.insightsService.listMonthlyInsights(workspaceId, year, month),
      this.listActiveMembers(workspaceId),
      this.prisma.transaction.findMany({
        where: {
          workspaceId,
          isDeleted: false,
          type: TransactionType.EXPENSE,
          visibility: TransactionVisibility.SHARED,
          transactionDate: {
            gte: start,
            lt: endExclusive,
          },
        },
        include: {
          paidBy: true,
          participants: true,
        },
      }),
      this.prisma.settlementTransfer.findMany({
        where: {
          workspaceId,
          year,
          month,
        },
        select: {
          fromUserId: true,
          toUserId: true,
          amount: true,
        },
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

    const settlement = this.buildSettlementSummary({
      members: members.map((member) => ({
        userId: member.userId,
        name: member.nickname ?? member.user.name,
      })),
      transactions: sharedTransactions,
      transfers: settlementTransfers,
    });

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
      insights,
      settlement,
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

  private async listActiveMembers(workspaceId: string) {
    if (typeof this.prisma.workspaceMember?.findMany !== 'function') {
      return [];
    }

    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
      orderBy: [{ joinedAt: 'asc' }, { createdAt: 'asc' }],
    });
  }

  private buildSettlementSummary(input: {
    members: {
      userId: string;
      name: string;
    }[];
    transactions: {
      amount: Prisma.Decimal;
      paidByUserId: string | null;
      participants: {
        userId: string;
        shareType: ShareType;
        shareValue: Prisma.Decimal | null;
      }[];
    }[];
    transfers: {
      fromUserId: string;
      toUserId: string;
      amount: Prisma.Decimal;
    }[];
  }) {
    const balances = new Map(
      input.members.map((member) => [member.userId, new Prisma.Decimal(0)]),
    );
    const memberNameMap = new Map(
      input.members.map((member) => [member.userId, member.name]),
    );

    for (const transaction of input.transactions) {
      if (
        !transaction.paidByUserId ||
        !balances.has(transaction.paidByUserId)
      ) {
        continue;
      }

      balances.set(
        transaction.paidByUserId,
        balances.get(transaction.paidByUserId)!.add(transaction.amount),
      );

      const shares =
        transaction.participants.length > 0
          ? this.resolveStoredParticipantShares(
              transaction.amount,
              transaction.participants,
            )
          : this.resolveEqualShares(
              transaction.amount,
              input.members.map((member) => member.userId),
            );

      for (const share of shares) {
        if (!balances.has(share.userId)) {
          continue;
        }

        balances.set(
          share.userId,
          balances.get(share.userId)!.sub(share.amount),
        );
      }
    }

    for (const transfer of input.transfers) {
      if (balances.has(transfer.fromUserId)) {
        balances.set(
          transfer.fromUserId,
          balances.get(transfer.fromUserId)!.add(transfer.amount),
        );
      }

      if (balances.has(transfer.toUserId)) {
        balances.set(
          transfer.toUserId,
          balances.get(transfer.toUserId)!.sub(transfer.amount),
        );
      }
    }

    const balanceRows = input.members.map((member) => ({
      userId: member.userId,
      name: member.name,
      netAmount: balances.get(member.userId)?.toFixed(2) ?? '0.00',
    }));

    const creditors = balanceRows
      .map((item) => ({
        ...item,
        amount: new Prisma.Decimal(item.netAmount),
      }))
      .filter((item) => item.amount.gt(0))
      .sort((left, right) => right.amount.comparedTo(left.amount));
    const debtors = balanceRows
      .map((item) => ({
        ...item,
        amount: new Prisma.Decimal(item.netAmount).abs(),
      }))
      .filter((item) => new Prisma.Decimal(item.netAmount).lt(0))
      .sort((left, right) => right.amount.comparedTo(left.amount));

    const suggestedTransfers: {
      fromUserId: string;
      fromName: string;
      toUserId: string;
      toName: string;
      amount: string;
    }[] = [];

    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      const transferAmount = Prisma.Decimal.min(creditor.amount, debtor.amount);

      if (transferAmount.gt(0)) {
        suggestedTransfers.push({
          fromUserId: debtor.userId,
          fromName: memberNameMap.get(debtor.userId) ?? debtor.name,
          toUserId: creditor.userId,
          toName: memberNameMap.get(creditor.userId) ?? creditor.name,
          amount: transferAmount.toFixed(2),
        });
      }

      creditor.amount = creditor.amount.sub(transferAmount);
      debtor.amount = debtor.amount.sub(transferAmount);

      if (!creditor.amount.gt(0)) {
        creditorIndex += 1;
      }

      if (!debtor.amount.gt(0)) {
        debtorIndex += 1;
      }
    }

    return {
      totalSharedExpense: input.transactions
        .reduce(
          (sum, transaction) => sum.add(transaction.amount),
          new Prisma.Decimal(0),
        )
        .toFixed(2),
      balances: balanceRows,
      suggestedTransfers,
    };
  }

  private resolveStoredParticipantShares(
    amount: Prisma.Decimal,
    participants: {
      userId: string;
      shareType: ShareType;
      shareValue: Prisma.Decimal | null;
    }[],
  ) {
    const shareType = participants[0]?.shareType ?? ShareType.EQUAL;

    if (shareType === ShareType.EQUAL) {
      return this.resolveEqualShares(
        amount,
        participants.map((participant) => participant.userId),
      );
    }

    if (shareType === ShareType.PERCENTAGE) {
      return participants.map((participant) => ({
        userId: participant.userId,
        amount: amount.mul(participant.shareValue ?? 0).div(100),
      }));
    }

    return participants.map((participant) => ({
      userId: participant.userId,
      amount: participant.shareValue ?? new Prisma.Decimal(0),
    }));
  }

  private resolveEqualShares(amount: Prisma.Decimal, userIds: string[]) {
    if (userIds.length === 0) {
      return [];
    }

    const totalCents = amount.mul(100);
    const baseShare = totalCents.divToInt(userIds.length);
    let remainder = totalCents.sub(baseShare.mul(userIds.length)).toNumber();

    return userIds.map((userId) => {
      const cents = baseShare.add(remainder > 0 ? 1 : 0);
      remainder = Math.max(remainder - 1, 0);

      return {
        userId,
        amount: cents.div(100),
      };
    });
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Prisma,
  ShareType,
  TransactionVisibility,
  TransactionType,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { getMonthRange } from '../../../common/utils/month-range.util';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { CreateSettlementTransferRequestDto } from '../dto/create-settlement-transfer-request.dto';
import { SettlementSummaryResponseDto } from '../dto/settlement-summary-response.dto';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async getMonthlySummary(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
  ): Promise<SettlementSummaryResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const { start, endExclusive } = getMonthRange(year, month);
    const [members, transactions, transfers] = await Promise.all([
      this.prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          status: WorkspaceMemberStatus.ACTIVE,
        },
        include: {
          user: true,
        },
        orderBy: [{ joinedAt: 'asc' }, { createdAt: 'asc' }],
      }),
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
          participants: true,
        },
      }),
      this.prisma.settlementTransfer.findMany({
        where: {
          workspaceId,
          year,
          month,
        },
        include: {
          fromUser: true,
          toUser: true,
        },
        orderBy: [{ settledAt: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    const summary = this.buildSettlementSummary({
      members: members.map((member) => ({
        userId: member.userId,
        name: member.nickname ?? member.user.name,
      })),
      transactions: transactions.map((transaction) => ({
        amount: transaction.amount,
        paidByUserId: transaction.paidByUserId,
        participants: transaction.participants,
      })),
      transfers: transfers.map((transfer) => ({
        fromUserId: transfer.fromUserId,
        toUserId: transfer.toUserId,
        amount: transfer.amount,
      })),
    });

    return {
      ...summary,
      completedTransfers: transfers.map((transfer) => ({
        id: transfer.id,
        fromUserId: transfer.fromUserId,
        fromName: transfer.fromUser.name,
        toUserId: transfer.toUserId,
        toName: transfer.toUser.name,
        amount: transfer.amount.toFixed(2),
        settledAt: transfer.settledAt.toISOString(),
        memo: transfer.memo,
      })),
    };
  }

  async recordTransfer(
    workspaceId: string,
    year: number,
    month: number,
    userId: string,
    input: CreateSettlementTransferRequestDto,
  ): Promise<SettlementSummaryResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { baseCurrency: true },
    });

    if (!workspace) {
      throw new BadRequestException('Workspace was not found.');
    }

    if (input.fromUserId === input.toUserId) {
      throw new BadRequestException(
        'Settlement transfer must involve two members.',
      );
    }

    const summary = await this.getMonthlySummary(
      workspaceId,
      year,
      month,
      userId,
    );
    const suggested = summary.suggestedTransfers.find(
      (item) =>
        item.fromUserId === input.fromUserId &&
        item.toUserId === input.toUserId,
    );

    if (!suggested) {
      throw new BadRequestException(
        'No outstanding transfer exists for this member pair.',
      );
    }

    const requestedAmount = new Prisma.Decimal(input.amount);
    const suggestedAmount = new Prisma.Decimal(suggested.amount);

    if (requestedAmount.gt(suggestedAmount)) {
      throw new BadRequestException(
        'Settlement amount cannot exceed the outstanding transfer.',
      );
    }

    await this.prisma.settlementTransfer.create({
      data: {
        workspaceId,
        year,
        month,
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        amount: requestedAmount,
        currency: workspace.baseCurrency,
        memo: input.memo ?? null,
        settledAt: new Date(),
        createdByUserId: userId,
      },
    });

    return this.getMonthlySummary(workspaceId, year, month, userId);
  }

  private buildSettlementSummary(input: {
    members: { userId: string; name: string }[];
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
      .map((item) => ({ ...item, amount: new Prisma.Decimal(item.netAmount) }))
      .filter((item) => item.amount.gt(0))
      .sort((left, right) => right.amount.comparedTo(left.amount));
    const debtors = balanceRows
      .map((item) => ({
        ...item,
        amount: new Prisma.Decimal(item.netAmount).abs(),
      }))
      .filter((item) => new Prisma.Decimal(item.netAmount).lt(0))
      .sort((left, right) => right.amount.comparedTo(left.amount));

    const suggestedTransfers: SettlementSummaryResponseDto['suggestedTransfers'] =
      [];

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

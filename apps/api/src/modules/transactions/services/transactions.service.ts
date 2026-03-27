import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  Transaction,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { CreateTransactionRequestDto } from '../dto/create-transaction-request.dto';
import { ListTransactionsQueryDto } from '../dto/list-transactions-query.dto';
import { TransactionListResponseDto } from '../dto/transaction-list-response.dto';
import { TransactionResponseDto } from '../dto/transaction-response.dto';

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    category: true;
    paidBy: true;
  };
}>;

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    input: CreateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const paidByUserId = input.paidByUserId ?? userId;

    await this.assertValidPaidBy(workspaceId, paidByUserId);
    await this.assertValidCategory(workspaceId, input.categoryId, input.type);

    const transaction = await this.prisma.transaction.create({
      data: {
        workspaceId,
        type: input.type,
        visibility: input.visibility,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency,
        transactionDate: new Date(input.transactionDate),
        categoryId: input.categoryId ?? null,
        memo: input.memo ?? null,
        createdByUserId: userId,
        paidByUserId,
      },
      include: {
        category: true,
        paidBy: true,
      },
    });

    return this.toResponse(transaction);
  }

  async list(
    workspaceId: string,
    userId: string,
    query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const limit = query.limit ?? 20;
    const items = await this.prisma.transaction.findMany({
      where: {
        workspaceId,
        isDeleted: false,
        type: query.type,
        visibility: query.visibility,
        categoryId: query.categoryId,
        paidByUserId: query.paidByUserId,
        ...(query.from || query.to
          ? {
              transactionDate: {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(query.to ? { lte: new Date(query.to) } : {}),
              },
            }
          : {}),
      },
      include: {
        category: true,
        paidBy: true,
      },
      orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take: limit + 1,
    });

    const hasNextPage = items.length > limit;
    const pageItems = hasNextPage ? items.slice(0, limit) : items;

    return {
      items: pageItems.map((item) => this.toResponse(item)),
      nextCursor: hasNextPage ? (pageItems.at(-1)?.id ?? null) : null,
    };
  }

  async detail(
    workspaceId: string,
    transactionId: string,
    userId: string,
  ): Promise<TransactionResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    const transaction = await this.findTransactionOrThrow(
      workspaceId,
      transactionId,
    );
    return this.toResponse(transaction);
  }

  async remove(
    workspaceId: string,
    transactionId: string,
    userId: string,
  ): Promise<TransactionResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    await this.findTransactionOrThrow(workspaceId, transactionId);

    const transaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { isDeleted: true },
      include: {
        category: true,
        paidBy: true,
      },
    });

    return this.toResponse(transaction);
  }

  private async findTransactionOrThrow(
    workspaceId: string,
    transactionId: string,
  ): Promise<TransactionWithRelations> {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        workspaceId,
        isDeleted: false,
      },
      include: {
        category: true,
        paidBy: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction was not found.');
    }

    return transaction;
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
    type: Transaction['type'],
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

  private toResponse(
    transaction: TransactionWithRelations,
  ): TransactionResponseDto {
    return {
      id: transaction.id,
      workspaceId: transaction.workspaceId,
      type: transaction.type,
      visibility: transaction.visibility,
      amount: transaction.amount.toFixed(2),
      currency: transaction.currency,
      transactionDate: transaction.transactionDate.toISOString().slice(0, 10),
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name ?? null,
      memo: transaction.memo,
      createdByUserId: transaction.createdByUserId,
      paidByUserId: transaction.paidByUserId,
      paidByUserName: transaction.paidBy?.name ?? null,
      isDeleted: transaction.isDeleted,
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}

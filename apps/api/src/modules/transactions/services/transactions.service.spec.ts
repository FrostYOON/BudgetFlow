import {
  Prisma,
  TransactionType,
  TransactionVisibility,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: {
    workspaceMember: { findUnique: jest.Mock };
    category: { findFirst: jest.Mock };
    transaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      workspaceMember: {
        findUnique: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
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

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('create should create a transaction and default paidByUserId to current user', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue({
      status: WorkspaceMemberStatus.ACTIVE,
    });
    prisma.transaction.create.mockResolvedValue({
      id: 'transaction-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('52000.00'),
      currency: 'KRW',
      transactionDate: new Date('2026-03-24T00:00:00.000Z'),
      categoryId: null,
      category: null,
      memo: 'Mart run',
      createdByUserId: 'user-1',
      paidByUserId: 'user-1',
      paidBy: { name: 'Minji' },
      isDeleted: false,
      createdAt: new Date('2026-03-24T12:00:00.000Z'),
    });

    const result = await service.create('workspace-1', 'user-1', {
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: '52000.00',
      currency: 'KRW',
      transactionDate: '2026-03-24',
      memo: 'Mart run',
    });

    expect(result.paidByUserId).toBe('user-1');
    expect(prisma.transaction.create).toHaveBeenCalled();
  });

  it('create should reject when category type does not match transaction type', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue({
      status: WorkspaceMemberStatus.ACTIVE,
    });
    prisma.category.findFirst.mockResolvedValue({
      id: 'category-1',
      workspaceId: 'workspace-1',
      type: TransactionType.INCOME,
      isArchived: false,
    });

    await expect(
      service.create('workspace-1', 'user-1', {
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: '52000.00',
        currency: 'KRW',
        transactionDate: '2026-03-24',
        categoryId: 'category-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('list should return items and nextCursor when more records exist', async () => {
    prisma.transaction.findMany.mockResolvedValue([
      {
        id: 'transaction-2',
        workspaceId: 'workspace-1',
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: new Prisma.Decimal('1000.00'),
        currency: 'KRW',
        transactionDate: new Date('2026-03-25T00:00:00.000Z'),
        categoryId: null,
        category: null,
        memo: null,
        createdByUserId: 'user-1',
        paidByUserId: 'user-1',
        paidBy: { name: 'Minji' },
        isDeleted: false,
        createdAt: new Date('2026-03-25T10:00:00.000Z'),
      },
      {
        id: 'transaction-1',
        workspaceId: 'workspace-1',
        type: TransactionType.EXPENSE,
        visibility: TransactionVisibility.SHARED,
        amount: new Prisma.Decimal('500.00'),
        currency: 'KRW',
        transactionDate: new Date('2026-03-24T00:00:00.000Z'),
        categoryId: null,
        category: null,
        memo: null,
        createdByUserId: 'user-1',
        paidByUserId: 'user-1',
        paidBy: { name: 'Minji' },
        isDeleted: false,
        createdAt: new Date('2026-03-24T10:00:00.000Z'),
      },
    ]);

    const result = await service.list('workspace-1', 'user-1', {
      limit: 1,
    });

    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBe('transaction-2');
  });

  it('detail should throw when transaction does not exist', async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);

    await expect(
      service.detail('workspace-1', 'transaction-1', 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update should patch a transaction and allow clearing optional fields', async () => {
    prisma.transaction.findFirst.mockResolvedValue({
      id: 'transaction-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('52000.00'),
      currency: 'KRW',
      transactionDate: new Date('2026-03-24T00:00:00.000Z'),
      categoryId: 'category-1',
      category: { name: 'Groceries' },
      memo: 'Mart run',
      createdByUserId: 'user-1',
      paidByUserId: 'user-1',
      paidBy: { name: 'Minji' },
      isDeleted: false,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
    });
    prisma.workspaceMember.findUnique.mockResolvedValue({
      status: WorkspaceMemberStatus.ACTIVE,
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'transaction-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.PERSONAL,
      amount: new Prisma.Decimal('21000.00'),
      currency: 'KRW',
      transactionDate: new Date('2026-03-25T00:00:00.000Z'),
      categoryId: null,
      category: null,
      memo: null,
      createdByUserId: 'user-1',
      paidByUserId: 'user-2',
      paidBy: { name: 'Jisoo' },
      isDeleted: false,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
    });

    const result = await service.update(
      'workspace-1',
      'transaction-1',
      'user-1',
      {
        visibility: TransactionVisibility.PERSONAL,
        amount: '21000.00',
        transactionDate: '2026-03-25',
        categoryId: null,
        memo: null,
        paidByUserId: 'user-2',
      },
    );

    expect(result.visibility).toBe(TransactionVisibility.PERSONAL);
    expect(result.categoryId).toBeNull();
    expect(result.memo).toBeNull();
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 'transaction-1' },
      data: {
        accountId: undefined,
        visibility: TransactionVisibility.PERSONAL,
        amount: new Prisma.Decimal('21000.00'),
        currency: undefined,
        transactionDate: new Date('2026-03-25'),
        categoryId: null,
        memo: null,
        paidByUserId: 'user-2',
      },
      include: {
        account: true,
        category: true,
        paidBy: true,
      },
    });
  });

  it('update should reject when the next category type does not match the transaction type', async () => {
    prisma.transaction.findFirst.mockResolvedValue({
      id: 'transaction-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('52000.00'),
      currency: 'KRW',
      transactionDate: new Date('2026-03-24T00:00:00.000Z'),
      categoryId: null,
      category: null,
      memo: null,
      createdByUserId: 'user-1',
      paidByUserId: 'user-1',
      paidBy: { name: 'Minji' },
      isDeleted: false,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
    });
    prisma.workspaceMember.findUnique.mockResolvedValue({
      status: WorkspaceMemberStatus.ACTIVE,
    });
    prisma.category.findFirst.mockResolvedValue({
      id: 'category-1',
      workspaceId: 'workspace-1',
      type: TransactionType.INCOME,
      isArchived: false,
    });

    await expect(
      service.update('workspace-1', 'transaction-1', 'user-1', {
        categoryId: 'category-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('remove should soft-delete the transaction', async () => {
    prisma.transaction.findFirst.mockResolvedValue({
      id: 'transaction-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('52000.00'),
      currency: 'KRW',
      transactionDate: new Date('2026-03-24T00:00:00.000Z'),
      categoryId: null,
      category: null,
      memo: null,
      createdByUserId: 'user-1',
      paidByUserId: 'user-1',
      paidBy: { name: 'Minji' },
      isDeleted: false,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'transaction-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('52000.00'),
      currency: 'KRW',
      transactionDate: new Date('2026-03-24T00:00:00.000Z'),
      categoryId: null,
      category: null,
      memo: null,
      createdByUserId: 'user-1',
      paidByUserId: 'user-1',
      paidBy: { name: 'Minji' },
      isDeleted: true,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
    });

    const result = await service.remove(
      'workspace-1',
      'transaction-1',
      'user-1',
    );

    expect(result.isDeleted).toBe(true);
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 'transaction-1' },
      data: { isDeleted: true },
      include: {
        account: true,
        category: true,
        paidBy: true,
      },
    });
  });

  it('restore should restore a soft-deleted transaction', async () => {
    prisma.transaction.findFirst.mockResolvedValue({
      id: 'transaction-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('52000.00'),
      currency: 'KRW',
      transactionDate: new Date('2026-03-24T00:00:00.000Z'),
      categoryId: null,
      category: null,
      memo: null,
      createdByUserId: 'user-1',
      paidByUserId: 'user-1',
      paidBy: { name: 'Minji' },
      isDeleted: true,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'transaction-1',
      workspaceId: 'workspace-1',
      type: TransactionType.EXPENSE,
      visibility: TransactionVisibility.SHARED,
      amount: new Prisma.Decimal('52000.00'),
      currency: 'KRW',
      transactionDate: new Date('2026-03-24T00:00:00.000Z'),
      categoryId: null,
      category: null,
      memo: null,
      createdByUserId: 'user-1',
      paidByUserId: 'user-1',
      paidBy: { name: 'Minji' },
      isDeleted: false,
      createdAt: new Date('2026-03-24T10:00:00.000Z'),
    });

    const result = await service.restore(
      'workspace-1',
      'transaction-1',
      'user-1',
    );

    expect(result.isDeleted).toBe(false);
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 'transaction-1' },
      data: { isDeleted: false },
      include: {
        account: true,
        category: true,
        paidBy: true,
      },
    });
  });
});

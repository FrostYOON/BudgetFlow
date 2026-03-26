import { CategoryType, Prisma } from '@budgetflow/database';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: {
    category: {
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      category: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
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

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('list should return workspace categories for an active member', async () => {
    prisma.category.findMany.mockResolvedValue([
      {
        id: 'category-1',
        workspaceId: 'workspace-1',
        name: 'Groceries',
        type: CategoryType.EXPENSE,
        color: '#4E8B57',
        icon: 'cart',
        sortOrder: 0,
        isDefault: false,
        isArchived: false,
      },
    ]);

    const result = await service.list('workspace-1', 'user-1', {
      type: CategoryType.EXPENSE,
    });

    expect(workspacesService.assertMemberAccess).toHaveBeenCalledWith(
      'workspace-1',
      'user-1',
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Groceries');
  });

  it('create should throw conflict on duplicate category', async () => {
    prisma.category.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
      }),
    );

    await expect(
      service.create('workspace-1', 'user-1', {
        name: 'Groceries',
        type: CategoryType.EXPENSE,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update should throw when category is missing', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(
      service.update('workspace-1', 'category-1', 'user-1', {
        name: 'Food',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('archive should mark category as archived', async () => {
    prisma.category.findFirst.mockResolvedValue({
      id: 'category-1',
      workspaceId: 'workspace-1',
      name: 'Groceries',
      type: CategoryType.EXPENSE,
      color: null,
      icon: null,
      sortOrder: 0,
      isDefault: false,
      isArchived: false,
    });
    prisma.category.update.mockResolvedValue({
      id: 'category-1',
      workspaceId: 'workspace-1',
      name: 'Groceries',
      type: CategoryType.EXPENSE,
      color: null,
      icon: null,
      sortOrder: 0,
      isDefault: false,
      isArchived: true,
    });

    const result = await service.archive('workspace-1', 'category-1', 'user-1');

    expect(result.isArchived).toBe(true);
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'category-1' },
      data: { isArchived: true },
    });
  });
});

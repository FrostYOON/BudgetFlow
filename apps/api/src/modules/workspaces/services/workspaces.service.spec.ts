import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CategoryType,
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
  WorkspaceType,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let prisma: {
    $transaction: jest.Mock;
    workspaceMember: { findMany: jest.Mock; findUnique: jest.Mock };
    workspace: { findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      workspaceMember: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      workspace: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  it('create should create a workspace and owner membership', async () => {
    const transactionClient = {
      workspace: {
        create: jest.fn().mockResolvedValue({
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Home',
          type: WorkspaceType.COUPLE,
          baseCurrency: 'KRW',
          timezone: 'Asia/Seoul',
          ownerUserId: '22222222-2222-2222-2222-222222222222',
        }),
      },
      workspaceMember: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      category: {
        createMany: jest.fn().mockResolvedValue({ count: 15 }),
      },
    };

    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
        callback(transactionClient),
    );

    const result = await service.create(
      '22222222-2222-2222-2222-222222222222',
      {
        name: 'Home',
        type: WorkspaceType.COUPLE,
      },
    );

    expect(result.name).toBe('Home');
    expect(prisma.$transaction).toHaveBeenCalled();

    const [createManyInput] = transactionClient.category.createMany.mock
      .calls[0] as [
      {
        data: Array<{
          workspaceId: string;
          name: string;
          type: CategoryType;
          isDefault: boolean;
        }>;
      },
    ];

    expect(createManyInput.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workspaceId: '11111111-1111-1111-1111-111111111111',
          name: 'Salary',
          type: CategoryType.INCOME,
          isDefault: true,
        }),
        expect.objectContaining({
          workspaceId: '11111111-1111-1111-1111-111111111111',
          name: 'Market',
          type: CategoryType.EXPENSE,
          isDefault: true,
        }),
      ]),
    );
  });

  it('createPersonalWorkspace should create a personal workspace with inferred defaults', async () => {
    const transactionClient = {
      workspace: {
        create: jest.fn().mockResolvedValue({
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          name: "Minji's Budget",
          type: WorkspaceType.PERSONAL,
          baseCurrency: 'CAD',
          timezone: 'America/Toronto',
          ownerUserId: '22222222-2222-2222-2222-222222222222',
        }),
      },
      workspaceMember: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      category: {
        createMany: jest.fn().mockResolvedValue({ count: 15 }),
      },
    };

    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
        callback(transactionClient),
    );

    const result = await service.createPersonalWorkspace({
      ownerUserId: '22222222-2222-2222-2222-222222222222',
      ownerName: 'Minji',
      locale: 'en-CA',
      timezone: 'America/Toronto',
    });

    expect(result).toMatchObject({
      name: "Minji's Budget",
      type: WorkspaceType.PERSONAL,
      baseCurrency: 'CAD',
      timezone: 'America/Toronto',
    });
  });

  it('listForUser should return active memberships as workspace list items', async () => {
    prisma.workspaceMember.findMany.mockResolvedValue([
      {
        role: WorkspaceMemberRole.OWNER,
        workspace: {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Home',
          type: WorkspaceType.COUPLE,
          baseCurrency: 'KRW',
          timezone: 'Asia/Seoul',
        },
      },
    ]);

    const result = await service.listForUser(
      '22222222-2222-2222-2222-222222222222',
    );

    expect(result).toEqual([
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Home',
        type: WorkspaceType.COUPLE,
        baseCurrency: 'KRW',
        timezone: 'Asia/Seoul',
        memberRole: WorkspaceMemberRole.OWNER,
      },
    ]);
  });

  it('getDetail should throw when workspace does not exist', async () => {
    prisma.workspace.findUnique.mockResolvedValue(null);

    await expect(
      service.getDetail(
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('getDetail should throw when user is not a member', async () => {
    prisma.workspace.findUnique.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Home',
      type: WorkspaceType.COUPLE,
      baseCurrency: 'KRW',
      timezone: 'Asia/Seoul',
      ownerUserId: '33333333-3333-3333-3333-333333333333',
      members: [
        {
          userId: '33333333-3333-3333-3333-333333333333',
          role: WorkspaceMemberRole.OWNER,
          status: WorkspaceMemberStatus.ACTIVE,
          user: { name: 'Owner' },
        },
      ],
    });

    await expect(
      service.getDetail(
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('assertMemberAccess should reject when user is not an active member', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue(null);

    await expect(
      service.assertMemberAccess(
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('update should allow owner to change workspace settings', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue({
      role: WorkspaceMemberRole.OWNER,
      status: WorkspaceMemberStatus.ACTIVE,
    });
    prisma.workspace.findUnique.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Home',
      type: WorkspaceType.COUPLE,
      baseCurrency: 'KRW',
      timezone: 'Asia/Seoul',
      ownerUserId: '22222222-2222-2222-2222-222222222222',
    });
    prisma.workspace.update.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Budget Nest',
      type: WorkspaceType.FAMILY,
      baseCurrency: 'CAD',
      timezone: 'America/Toronto',
      ownerUserId: '22222222-2222-2222-2222-222222222222',
    });

    const result = await service.update(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      {
        name: 'Budget Nest',
        type: WorkspaceType.FAMILY,
        baseCurrency: 'CAD',
        timezone: 'America/Toronto',
      },
    );

    expect(prisma.workspace.update).toHaveBeenCalledWith({
      where: { id: '11111111-1111-1111-1111-111111111111' },
      data: {
        name: 'Budget Nest',
        type: WorkspaceType.FAMILY,
        baseCurrency: 'CAD',
        timezone: 'America/Toronto',
      },
    });
    expect(result.name).toBe('Budget Nest');
  });
});

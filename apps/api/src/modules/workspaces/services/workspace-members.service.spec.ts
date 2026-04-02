import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceMembersService } from './workspace-members.service';

describe('WorkspaceMembersService', () => {
  let service: WorkspaceMembersService;
  let prisma: {
    workspaceMember: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
    assertOwner: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      workspaceMember: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
      assertOwner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMembersService,
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

    service = module.get(WorkspaceMembersService);
  });

  it('listMembers should include workspace nicknames', async () => {
    prisma.workspaceMember.findMany.mockResolvedValue([
      {
        userId: 'user-1',
        nickname: 'Jisu',
        role: WorkspaceMemberRole.MEMBER,
        status: WorkspaceMemberStatus.ACTIVE,
        user: {
          name: 'Jisu',
        },
      },
    ]);

    const result = await service.listMembers('workspace-1', 'user-1');

    expect(prisma.workspaceMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workspaceId: 'workspace-1',
          status: WorkspaceMemberStatus.ACTIVE,
        },
      }),
    );
    expect(result[0].nickname).toBe('Jisu');
  });

  it('updateMyNickname should update the current member nickname', async () => {
    prisma.workspaceMember.update.mockResolvedValue({
      userId: 'user-1',
      nickname: 'Jisu',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.ACTIVE,
      user: {
        name: 'Jisu',
      },
    });

    const result = await service.updateMyNickname('workspace-1', 'user-1', {
      nickname: 'Jisu',
    });

    expect(workspacesService.assertMemberAccess).toHaveBeenCalledWith(
      'workspace-1',
      'user-1',
    );
    expect(result.nickname).toBe('Jisu');
  });

  it('updateMyNickname should reject empty payloads', async () => {
    await expect(
      service.updateMyNickname('workspace-1', 'user-1', {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('removeMember should mark an active member as left', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue({
      userId: 'user-2',
      nickname: 'Jisu',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.ACTIVE,
      user: {
        name: 'Jisu',
      },
    });
    prisma.workspaceMember.update.mockResolvedValue({
      userId: 'user-2',
      nickname: 'Jisu',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.LEFT,
      user: {
        name: 'Jisu',
      },
    });

    const result = await service.removeMember(
      'workspace-1',
      'owner-1',
      'user-2',
    );

    expect(workspacesService.assertOwner).toHaveBeenCalledWith(
      'workspace-1',
      'owner-1',
    );
    expect(result.status).toBe(WorkspaceMemberStatus.LEFT);
  });

  it('removeMember should reject removing the acting owner', async () => {
    await expect(
      service.removeMember('workspace-1', 'owner-1', 'owner-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('removeMember should reject removing another owner', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue({
      userId: 'owner-2',
      nickname: null,
      role: WorkspaceMemberRole.OWNER,
      status: WorkspaceMemberStatus.ACTIVE,
      user: {
        name: 'Owner Two',
      },
    });

    await expect(
      service.removeMember('workspace-1', 'owner-1', 'owner-2'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('removeMember should reject missing memberships', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue(null);

    await expect(
      service.removeMember('workspace-1', 'owner-1', 'user-2'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

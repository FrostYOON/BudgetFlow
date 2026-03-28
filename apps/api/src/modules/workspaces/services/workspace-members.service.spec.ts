import { BadRequestException } from '@nestjs/common';
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
    workspaceMember: { findMany: jest.Mock; update: jest.Mock };
  };
  let workspacesService: {
    assertMemberAccess: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      workspaceMember: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    workspacesService = {
      assertMemberAccess: jest.fn(),
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
});

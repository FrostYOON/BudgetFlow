import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceInvitesService } from './workspace-invites.service';

describe('WorkspaceInvitesService', () => {
  let service: WorkspaceInvitesService;
  let prisma: {
    user: { findUnique: jest.Mock };
    workspaceMember: { findUnique: jest.Mock };
    workspaceInvite: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let workspacesService: {
    assertOwner: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      workspaceMember: { findUnique: jest.fn() },
      workspaceInvite: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    workspacesService = {
      assertOwner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceInvitesService,
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

    service = module.get<WorkspaceInvitesService>(WorkspaceInvitesService);
  });

  it('createInvite should create an invite after owner check', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.workspaceMember.findUnique.mockResolvedValue(null);
    prisma.workspaceInvite.findFirst.mockResolvedValue(null);
    prisma.workspaceInvite.create.mockResolvedValue({
      id: 'invite-1',
      email: 'jisu@example.com',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.INVITED,
      workspaceId: 'workspace-1',
      token: 'token-1',
      expiresAt: new Date('2026-04-01T00:00:00.000Z'),
    });

    const result = await service.createInvite('workspace-1', 'owner-1', {
      email: 'jisu@example.com',
      role: WorkspaceMemberRole.MEMBER,
    });

    expect(workspacesService.assertOwner).toHaveBeenCalledWith(
      'workspace-1',
      'owner-1',
    );
    expect(result.email).toBe('jisu@example.com');
  });

  it('createInvite should reject when a pending invite already exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.workspaceMember.findUnique.mockResolvedValue(null);
    prisma.workspaceInvite.findFirst.mockResolvedValue({
      id: 'invite-1',
      email: 'jisu@example.com',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.INVITED,
      workspaceId: 'workspace-1',
      token: 'token-1',
      expiresAt: new Date('2026-04-01T00:00:00.000Z'),
    });

    await expect(
      service.createInvite('workspace-1', 'owner-1', {
        email: 'jisu@example.com',
        role: WorkspaceMemberRole.MEMBER,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('listInvites should return invite list after owner check', async () => {
    prisma.workspaceInvite.findMany.mockResolvedValue([
      {
        id: 'invite-1',
        email: 'jisu@example.com',
        role: WorkspaceMemberRole.MEMBER,
        status: WorkspaceMemberStatus.INVITED,
        workspaceId: 'workspace-1',
        token: 'token-1',
        expiresAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    ]);

    const result = await service.listInvites('workspace-1', 'owner-1');

    expect(result).toHaveLength(1);
    expect(workspacesService.assertOwner).toHaveBeenCalled();
  });

  it('acceptInvite should reject when invite email does not match account', async () => {
    prisma.workspaceInvite.findUnique.mockResolvedValue({
      id: 'invite-1',
      email: 'other@example.com',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.INVITED,
      workspaceId: 'workspace-1',
      token: 'token-1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(
      service.acceptInvite('token-1', {
        userId: 'user-1',
        email: 'jisu@example.com',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('acceptInvite should reject when invite is not found', async () => {
    prisma.workspaceInvite.findUnique.mockResolvedValue(null);

    await expect(
      service.acceptInvite('missing-token', {
        userId: 'user-1',
        email: 'jisu@example.com',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('acceptInvite should reject when membership already active', async () => {
    prisma.workspaceInvite.findUnique.mockResolvedValue({
      id: 'invite-1',
      email: 'jisu@example.com',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.INVITED,
      workspaceId: 'workspace-1',
      token: 'token-1',
      expiresAt: new Date(Date.now() + 60_000),
    });
    prisma.workspaceMember.findUnique.mockResolvedValue({
      status: WorkspaceMemberStatus.ACTIVE,
    });

    await expect(
      service.acceptInvite('token-1', {
        userId: 'user-1',
        email: 'jisu@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('revokeInvite should mark a pending invite as left', async () => {
    prisma.workspaceInvite.findFirst.mockResolvedValue({
      id: 'invite-1',
      email: 'jisu@example.com',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.INVITED,
      workspaceId: 'workspace-1',
      token: 'token-1',
      expiresAt: new Date('2026-04-01T00:00:00.000Z'),
    });
    prisma.workspaceInvite.update.mockResolvedValue({
      id: 'invite-1',
      email: 'jisu@example.com',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.LEFT,
      workspaceId: 'workspace-1',
      token: 'token-1',
      expiresAt: new Date('2026-04-01T00:00:00.000Z'),
    });

    const result = await service.revokeInvite(
      'workspace-1',
      'invite-1',
      'owner-1',
    );

    expect(result.status).toBe(WorkspaceMemberStatus.LEFT);
    expect(workspacesService.assertOwner).toHaveBeenCalledWith(
      'workspace-1',
      'owner-1',
    );
  });

  it('resendInvite should refresh token and expiry for pending invites', async () => {
    prisma.workspaceInvite.findFirst.mockResolvedValue({
      id: 'invite-1',
      email: 'jisu@example.com',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.INVITED,
      workspaceId: 'workspace-1',
      token: 'token-1',
      expiresAt: new Date('2026-04-01T00:00:00.000Z'),
    });
    prisma.workspaceInvite.update.mockResolvedValue({
      id: 'invite-1',
      email: 'jisu@example.com',
      role: WorkspaceMemberRole.MEMBER,
      status: WorkspaceMemberStatus.INVITED,
      workspaceId: 'workspace-1',
      token: 'token-2',
      expiresAt: new Date('2026-04-08T00:00:00.000Z'),
    });

    const result = await service.resendInvite(
      'workspace-1',
      'invite-1',
      'owner-1',
    );

    expect(result.token).toBe('token-2');
    expect(result.status).toBe(WorkspaceMemberStatus.INVITED);
  });
});

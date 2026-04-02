import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { WorkspaceInvite, WorkspaceMemberStatus } from '@budgetflow/database';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-request.interface';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppLoggerService } from '../../../core/logger/app-logger.service';
import { CreateWorkspaceInviteRequestDto } from '../dto/create-workspace-invite-request.dto';
import { AcceptWorkspaceInviteResponseDto } from '../dto/accept-workspace-invite-response.dto';
import { WorkspaceInviteResponseDto } from '../dto/workspace-invite-response.dto';
import { WorkspaceInviteEmailService } from './workspace-invite-email.service';
import { WorkspacesService } from './workspaces.service';

@Injectable()
export class WorkspaceInvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
    private readonly workspaceInviteEmailService: WorkspaceInviteEmailService,
    private readonly logger: AppLoggerService,
  ) {}

  async createInvite(
    workspaceId: string,
    actorUserId: string,
    input: CreateWorkspaceInviteRequestDto,
  ): Promise<WorkspaceInviteResponseDto> {
    await this.workspacesService.assertOwner(workspaceId, actorUserId);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    const existingMembership = existingUser
      ? await this.prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: existingUser.id,
            },
          },
        })
      : null;

    if (existingMembership?.status === WorkspaceMemberStatus.ACTIVE) {
      throw new ConflictException(
        'User is already an active workspace member.',
      );
    }

    const existingPendingInvite = await this.prisma.workspaceInvite.findFirst({
      where: {
        workspaceId,
        email: input.email,
        status: WorkspaceMemberStatus.INVITED,
      },
    });

    if (existingPendingInvite) {
      throw new ConflictException(
        'User already has a pending workspace invite.',
      );
    }

    const invite = await this.prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email: input.email,
        role: input.role,
        token: randomUUID(),
        expiresAt: this.buildExpirationDate(),
        createdByUserId: actorUserId,
      },
    });

    await this.sendInviteEmail(invite, actorUserId);

    return this.toInviteResponse(invite);
  }

  async listInvites(
    workspaceId: string,
    actorUserId: string,
  ): Promise<WorkspaceInviteResponseDto[]> {
    await this.workspacesService.assertOwner(workspaceId, actorUserId);

    const invites = await this.prisma.workspaceInvite.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return invites.map((invite) => this.toInviteResponse(invite));
  }

  async revokeInvite(
    workspaceId: string,
    inviteId: string,
    actorUserId: string,
  ): Promise<WorkspaceInviteResponseDto> {
    await this.workspacesService.assertOwner(workspaceId, actorUserId);

    const invite = await this.findInviteOrThrow(workspaceId, inviteId);

    if (invite.status !== WorkspaceMemberStatus.INVITED) {
      throw new ConflictException('Invite is not pending.');
    }

    const updatedInvite = await this.prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: {
        status: WorkspaceMemberStatus.LEFT,
      },
    });

    return this.toInviteResponse(updatedInvite);
  }

  async resendInvite(
    workspaceId: string,
    inviteId: string,
    actorUserId: string,
  ): Promise<WorkspaceInviteResponseDto> {
    await this.workspacesService.assertOwner(workspaceId, actorUserId);

    const invite = await this.findInviteOrThrow(workspaceId, inviteId);

    if (invite.status !== WorkspaceMemberStatus.INVITED) {
      throw new ConflictException('Invite is not pending.');
    }

    const updatedInvite = await this.prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: {
        token: randomUUID(),
        expiresAt: this.buildExpirationDate(),
      },
    });

    await this.sendInviteEmail(updatedInvite, actorUserId);

    return this.toInviteResponse(updatedInvite);
  }

  async acceptInvite(
    token: string,
    user: AuthenticatedUser,
  ): Promise<AcceptWorkspaceInviteResponseDto> {
    const invite = await this.findPendingInviteByTokenOrThrow(token);

    this.assertInviteBelongsToUser(invite, user);

    const existingMembership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId: user.userId,
        },
      },
    });

    if (existingMembership?.status === WorkspaceMemberStatus.ACTIVE) {
      throw new ConflictException(
        'User is already an active workspace member.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (existingMembership) {
        await tx.workspaceMember.update({
          where: {
            workspaceId_userId: {
              workspaceId: invite.workspaceId,
              userId: user.userId,
            },
          },
          data: {
            role: invite.role,
            status: WorkspaceMemberStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });
      } else {
        await tx.workspaceMember.create({
          data: {
            workspaceId: invite.workspaceId,
            userId: user.userId,
            role: invite.role,
            status: WorkspaceMemberStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });
      }

      await tx.workspaceInvite.update({
        where: { id: invite.id },
        data: {
          status: WorkspaceMemberStatus.ACTIVE,
          acceptedAt: new Date(),
        },
      });
    });

    return {
      workspaceId: invite.workspaceId,
      memberStatus: WorkspaceMemberStatus.ACTIVE,
    };
  }

  private async findInviteOrThrow(
    workspaceId: string,
    inviteId: string,
  ): Promise<WorkspaceInvite> {
    const invite = await this.prisma.workspaceInvite.findFirst({
      where: {
        id: inviteId,
        workspaceId,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite was not found.');
    }

    return invite;
  }

  private async findPendingInviteByTokenOrThrow(
    token: string,
  ): Promise<WorkspaceInvite> {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.status !== WorkspaceMemberStatus.INVITED) {
      throw new NotFoundException('Invite was not found.');
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      throw new ConflictException('Invite has expired.');
    }

    return invite;
  }

  private assertInviteBelongsToUser(
    invite: WorkspaceInvite,
    user: AuthenticatedUser,
  ): void {
    if (invite.email !== user.email) {
      throw new ForbiddenException('Invite does not belong to this account.');
    }
  }

  private toInviteResponse(
    invite: WorkspaceInvite,
  ): WorkspaceInviteResponseDto {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      workspaceId: invite.workspaceId,
      token: invite.token,
      expiresAt: invite.expiresAt,
    };
  }

  private buildExpirationDate(): Date {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);
    return expiration;
  }

  private async sendInviteEmail(
    invite: WorkspaceInvite,
    actorUserId: string,
  ): Promise<void> {
    try {
      const [workspace, actor] = await Promise.all([
        this.prisma.workspace.findUnique({
          where: { id: invite.workspaceId },
          select: { name: true },
        }),
        this.prisma.user.findUnique({
          where: { id: actorUserId },
          select: { name: true },
        }),
      ]);

      await this.workspaceInviteEmailService.sendInviteEmail({
        recipientEmail: invite.email,
        workspaceName: workspace?.name ?? 'BudgetFlow shared space',
        inviteToken: invite.token,
        inviterName: actor?.name ?? null,
      });
    } catch (error) {
      this.logger.warn(
        'Workspace invite email send attempt failed',
        WorkspaceInvitesService.name,
        {
          actorUserId,
          inviteId: invite.id,
          message: error instanceof Error ? error.message : 'unknown',
        },
      );
    }
  }
}

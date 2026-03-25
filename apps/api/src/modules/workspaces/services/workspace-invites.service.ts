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
import { CreateWorkspaceInviteRequestDto } from '../dto/create-workspace-invite-request.dto';
import { AcceptWorkspaceInviteResponseDto } from '../dto/accept-workspace-invite-response.dto';
import { WorkspaceInviteResponseDto } from '../dto/workspace-invite-response.dto';
import { WorkspacesService } from './workspaces.service';

@Injectable()
export class WorkspaceInvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async createInvite(
    workspaceId: string,
    actorUserId: string,
    input: CreateWorkspaceInviteRequestDto,
  ): Promise<WorkspaceInviteResponseDto> {
    await this.workspacesService.assertOwner(workspaceId, actorUserId);

    const existingMembership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId:
            (
              await this.prisma.user.findUnique({
                where: { email: input.email },
                select: { id: true },
              })
            )?.id ?? '',
        },
      },
    });

    if (existingMembership?.status === WorkspaceMemberStatus.ACTIVE) {
      throw new ConflictException(
        'User is already an active workspace member.',
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

  async acceptInvite(
    token: string,
    user: AuthenticatedUser,
  ): Promise<AcceptWorkspaceInviteResponseDto> {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.status !== WorkspaceMemberStatus.INVITED) {
      throw new NotFoundException('Invite was not found.');
    }

    if (invite.email !== user.email) {
      throw new ForbiddenException('Invite does not belong to this account.');
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      throw new ConflictException('Invite has expired.');
    }

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
}

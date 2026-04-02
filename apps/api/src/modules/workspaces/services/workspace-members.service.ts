import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { UpdateWorkspaceMemberNicknameRequestDto } from '../dto/update-workspace-member-nickname-request.dto';
import { WorkspaceMemberResponseDto } from '../dto/workspace-member-response.dto';
import { WorkspacesService } from './workspaces.service';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async listMembers(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberResponseDto[]> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const memberships = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        status: WorkspaceMemberStatus.ACTIVE,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (memberships.length === 0) {
      throw new NotFoundException('Workspace was not found.');
    }

    return memberships.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      nickname: member.nickname,
      role: member.role,
      status: member.status,
    }));
  }

  async updateMyNickname(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceMemberNicknameRequestDto,
  ): Promise<WorkspaceMemberResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    if (input.nickname === undefined) {
      throw new BadRequestException('Nickname is required.');
    }

    const membership = await this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: {
        nickname: input.nickname,
      },
      include: {
        user: true,
      },
    });

    return {
      userId: membership.userId,
      name: membership.user.name,
      nickname: membership.nickname,
      role: membership.role,
      status: membership.status,
    };
  }

  async removeMember(
    workspaceId: string,
    actorUserId: string,
    memberUserId: string,
  ): Promise<WorkspaceMemberResponseDto> {
    await this.workspacesService.assertOwner(workspaceId, actorUserId);

    if (actorUserId === memberUserId) {
      throw new BadRequestException(
        'Owners must transfer ownership before leaving the workspace.',
      );
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!membership || membership.status !== WorkspaceMemberStatus.ACTIVE) {
      throw new NotFoundException('Workspace member was not found.');
    }

    if (membership.role === WorkspaceMemberRole.OWNER) {
      throw new BadRequestException('Workspace owners cannot be removed.');
    }

    const removedMember = await this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
      data: {
        status: WorkspaceMemberStatus.LEFT,
      },
      include: {
        user: true,
      },
    });

    return {
      userId: removedMember.userId,
      name: removedMember.user.name,
      nickname: removedMember.nickname,
      role: removedMember.role,
      status: removedMember.status,
    };
  }
}

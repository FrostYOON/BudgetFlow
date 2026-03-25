import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  Workspace,
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { CreateWorkspaceRequestDto } from '../dto/create-workspace-request.dto';
import { WorkspaceListItemResponseDto } from '../dto/workspace-list-item-response.dto';
import { WorkspaceResponseDto } from '../dto/workspace-response.dto';

type WorkspaceWithMembers = Prisma.WorkspaceGetPayload<{
  include: {
    members: {
      include: {
        user: true;
      };
    };
  };
}>;

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ownerUserId: string,
    input: CreateWorkspaceRequestDto,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
        data: {
          name: input.name,
          type: input.type,
          baseCurrency: input.baseCurrency ?? 'KRW',
          timezone: input.timezone ?? 'Asia/Seoul',
          ownerUserId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: createdWorkspace.id,
          userId: ownerUserId,
          role: WorkspaceMemberRole.OWNER,
          status: WorkspaceMemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      return createdWorkspace;
    });

    return this.toWorkspaceResponse(workspace);
  }

  async listForUser(userId: string): Promise<WorkspaceListItemResponseDto[]> {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: {
        userId,
        status: WorkspaceMemberStatus.ACTIVE,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return memberships.map((membership) => ({
      id: membership.workspace.id,
      name: membership.workspace.name,
      type: membership.workspace.type,
      baseCurrency: membership.workspace.baseCurrency,
      timezone: membership.workspace.timezone,
      memberRole: membership.role,
    }));
  }

  async getDetail(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.findWorkspaceWithMembers(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace was not found.');
    }

    this.ensureMemberAccess(workspace, userId);

    return this.toWorkspaceResponse(workspace, true);
  }

  async assertOwner(workspaceId: string, userId: string): Promise<void> {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership || membership.status !== WorkspaceMemberStatus.ACTIVE) {
      throw new ForbiddenException('You do not have access to this workspace.');
    }

    if (membership.role !== WorkspaceMemberRole.OWNER) {
      throw new ForbiddenException(
        'Only workspace owners can perform this action.',
      );
    }
  }

  async assertMemberAccess(workspaceId: string, userId: string): Promise<void> {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership || membership.status !== WorkspaceMemberStatus.ACTIVE) {
      throw new ForbiddenException('You do not have access to this workspace.');
    }
  }

  private async findWorkspaceWithMembers(
    workspaceId: string,
  ): Promise<WorkspaceWithMembers | null> {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  private ensureMemberAccess(
    workspace: WorkspaceWithMembers,
    userId: string,
  ): void {
    const isMember = workspace.members.some(
      (member) => member.userId === userId,
    );

    if (!isMember) {
      throw new ForbiddenException('You do not have access to this workspace.');
    }
  }

  private toWorkspaceResponse(
    workspace: Workspace | WorkspaceWithMembers,
    includeMembers = false,
  ): WorkspaceResponseDto {
    const response: WorkspaceResponseDto = {
      id: workspace.id,
      name: workspace.name,
      type: workspace.type,
      baseCurrency: workspace.baseCurrency,
      timezone: workspace.timezone,
      ownerUserId: workspace.ownerUserId,
    };

    if (includeMembers && 'members' in workspace) {
      response.members = workspace.members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        role: member.role,
        status: member.status,
      }));
    }

    return response;
  }
}

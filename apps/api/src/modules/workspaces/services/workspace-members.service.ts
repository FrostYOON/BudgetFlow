import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkspaceMemberResponseDto } from '../dto/workspace-member-response.dto';
import { PrismaService } from '../../../core/database/prisma.service';
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
      role: member.role,
      status: member.status,
    }));
  }
}

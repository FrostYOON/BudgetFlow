import { Injectable } from '@nestjs/common';
import {
  RecurringExecutionRunStatus,
  TransactionType,
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { SettlementsService } from '../../settlements/services/settlements.service';
import {
  NotificationFeedResponseDto,
  NotificationItemResponseDto,
} from '../dto/notification-item-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settlementsService: SettlementsService,
  ) {}

  async getFeed(
    userId: string,
    workspaceId?: string,
  ): Promise<NotificationFeedResponseDto> {
    const items = await this.buildFeed(userId, workspaceId);
    return { items };
  }

  async markRead(
    userId: string,
    notificationKey: string,
  ): Promise<NotificationFeedResponseDto> {
    await this.prisma.notificationRead.upsert({
      where: {
        userId_notificationKey: {
          userId,
          notificationKey,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        userId,
        notificationKey,
      },
    });

    return this.getFeed(userId);
  }

  async markAllRead(
    userId: string,
    workspaceId?: string,
  ): Promise<NotificationFeedResponseDto> {
    const items = await this.buildFeed(userId, workspaceId);

    if (items.length > 0) {
      await this.prisma.notificationRead.createMany({
        data: items.map((item) => ({
          userId,
          notificationKey: item.key,
        })),
        skipDuplicates: true,
      });
    }

    return this.getFeed(userId, workspaceId);
  }

  private async buildFeed(
    userId: string,
    workspaceId?: string,
  ): Promise<NotificationItemResponseDto[]> {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: {
        userId,
        status: WorkspaceMemberStatus.ACTIVE,
        ...(workspaceId ? { workspaceId } : {}),
      },
      include: {
        workspace: true,
      },
    });

    const workspaceIds = memberships.map(
      (membership) => membership.workspaceId,
    );
    const reads = await this.prisma.notificationRead.findMany({
      where: { userId },
    });
    const readKeys = new Set(reads.map((item) => item.notificationKey));
    const items: NotificationItemResponseDto[] = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    for (const membership of memberships) {
      const workspace = membership.workspace;
      const workspaceKey = workspace.id;

      if (membership.role === WorkspaceMemberRole.OWNER) {
        const pendingInviteCount = await this.prisma.workspaceInvite.count({
          where: {
            workspaceId: workspace.id,
            status: WorkspaceMemberStatus.INVITED,
          },
        });

        if (pendingInviteCount > 0) {
          items.push({
            key: `workspace:${workspaceKey}:invites:${pendingInviteCount}`,
            type: 'INVITES',
            title: 'Pending invites',
            body: `${pendingInviteCount} invite${pendingInviteCount > 1 ? 's are' : ' is'} still pending in ${workspace.name}.`,
            href: '/app/settings',
            createdAt: now.toISOString(),
            isRead: readKeys.has(
              `workspace:${workspaceKey}:invites:${pendingInviteCount}`,
            ),
          });
        }
      }

      const monthlyBudget = await this.prisma.budgetMonth.findUnique({
        where: {
          workspaceId_year_month: {
            workspaceId: workspace.id,
            year,
            month,
          },
        },
        include: {
          categoryBudgets: true,
        },
      });

      if (monthlyBudget?.totalBudgetAmount) {
        const expenseAggregate = await this.prisma.transaction.aggregate({
          where: {
            workspaceId: workspace.id,
            isDeleted: false,
            type: TransactionType.EXPENSE,
            transactionDate: {
              gte: new Date(Date.UTC(year, month - 1, 1)),
              lt: new Date(Date.UTC(year, month, 1)),
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spent =
          expenseAggregate._sum.amount ??
          monthlyBudget.totalBudgetAmount.mul(0);
        if (spent.gt(monthlyBudget.totalBudgetAmount)) {
          const key = `workspace:${workspaceKey}:budget-over:${year}-${month}`;
          items.push({
            key,
            type: 'BUDGET',
            title: 'Budget exceeded',
            body: `${workspace.name} is over budget for ${year}-${String(month).padStart(2, '0')}.`,
            href: `/app/budgets?year=${year}&month=${month}`,
            createdAt: now.toISOString(),
            isRead: readKeys.has(key),
          });
        }
      }

      const settlementSummary = await this.settlementsService
        .getMonthlySummary(workspace.id, year, month, userId)
        .catch(() => null);

      if (settlementSummary) {
        for (const transfer of settlementSummary.suggestedTransfers.filter(
          (item) => item.fromUserId === userId,
        )) {
          const key = `workspace:${workspaceKey}:settlement:${year}-${month}:${transfer.fromUserId}:${transfer.toUserId}:${transfer.amount}`;
          items.push({
            key,
            type: 'SETTLEMENT',
            title: 'Settlement due',
            body: `You owe ${transfer.toName} ${transfer.amount} in ${workspace.name}.`,
            href: `/app/settlements?year=${year}&month=${month}`,
            createdAt: now.toISOString(),
            isRead: readKeys.has(key),
          });
        }
      }
    }

    if (workspaceIds.length > 0) {
      const failedRuns = await this.prisma.recurringExecutionRun.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          status: RecurringExecutionRunStatus.FAILED,
        },
        include: {
          workspace: true,
        },
        orderBy: [{ startedAt: 'desc' }],
        take: 5,
      });

      for (const run of failedRuns) {
        const key = `workspace:${run.workspaceId}:recurring-failed:${run.id}`;
        items.push({
          key,
          type: 'RECURRING',
          title: 'Recurring execution failed',
          body: `${run.workspace.name} had a failed recurring run on ${run.targetDate.toISOString().slice(0, 10)}.`,
          href: '/app/recurring',
          createdAt: run.startedAt.toISOString(),
          isRead: readKeys.has(key),
        });
      }
    }

    return items
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 20);
  }
}

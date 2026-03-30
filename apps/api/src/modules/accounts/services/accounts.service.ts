import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { CreateFinancialAccountRequestDto } from '../dto/create-financial-account-request.dto';
import { FinancialAccountResponseDto } from '../dto/financial-account-response.dto';
import { UpdateFinancialAccountRequestDto } from '../dto/update-financial-account-request.dto';

type FinancialAccountWithRelations = Prisma.FinancialAccountGetPayload<
  Record<string, never>
>;

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async list(
    workspaceId: string,
    userId: string,
  ): Promise<FinancialAccountResponseDto[]> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const accounts = await this.prisma.financialAccount.findMany({
      where: { workspaceId },
      orderBy: [
        { isArchived: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return accounts.map((account) => this.toResponse(account));
  }

  async create(
    workspaceId: string,
    userId: string,
    input: CreateFinancialAccountRequestDto,
  ): Promise<FinancialAccountResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const existingCount = await this.prisma.financialAccount.count({
      where: { workspaceId },
    });

    const account = await this.prisma.financialAccount.create({
      data: {
        workspaceId,
        createdByUserId: userId,
        name: input.name,
        type: input.type,
        currency: input.currency,
        institutionName: input.institutionName ?? null,
        lastFour: input.lastFour ?? null,
        sortOrder: existingCount,
      },
    });

    return this.toResponse(account);
  }

  async update(
    workspaceId: string,
    accountId: string,
    userId: string,
    input: UpdateFinancialAccountRequestDto,
  ): Promise<FinancialAccountResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    await this.findAccountOrThrow(workspaceId, accountId);

    const account = await this.prisma.financialAccount.update({
      where: { id: accountId },
      data: {
        name: input.name,
        type: input.type,
        currency: input.currency,
        institutionName:
          input.institutionName !== undefined
            ? input.institutionName
            : undefined,
        lastFour: input.lastFour !== undefined ? input.lastFour : undefined,
      },
    });

    return this.toResponse(account);
  }

  async archive(
    workspaceId: string,
    accountId: string,
    userId: string,
  ): Promise<FinancialAccountResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    await this.findAccountOrThrow(workspaceId, accountId);

    const account = await this.prisma.financialAccount.update({
      where: { id: accountId },
      data: { isArchived: true },
    });

    return this.toResponse(account);
  }

  private async findAccountOrThrow(workspaceId: string, accountId: string) {
    const account = await this.prisma.financialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });

    if (!account) {
      throw new NotFoundException('Financial account was not found.');
    }

    return account;
  }

  private toResponse(
    account: FinancialAccountWithRelations,
  ): FinancialAccountResponseDto {
    return {
      id: account.id,
      workspaceId: account.workspaceId,
      name: account.name,
      type: account.type,
      currency: account.currency,
      institutionName: account.institutionName,
      lastFour: account.lastFour,
      sortOrder: account.sortOrder,
      isArchived: account.isArchived,
      createdAt: account.createdAt.toISOString(),
    };
  }
}

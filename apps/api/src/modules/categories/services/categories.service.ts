import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category, Prisma } from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { CreateCategoryRequestDto } from '../dto/create-category-request.dto';
import { ListCategoriesQueryDto } from '../dto/list-categories-query.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { UpdateCategoryRequestDto } from '../dto/update-category-request.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async list(
    workspaceId: string,
    userId: string,
    query: ListCategoriesQueryDto,
  ): Promise<CategoryResponseDto[]> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    const categories = await this.prisma.category.findMany({
      where: {
        workspaceId,
        type: query.type,
        ...(query.includeArchived ? {} : { isArchived: false }),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories.map((category) => this.toResponse(category));
  }

  async create(
    workspaceId: string,
    userId: string,
    input: CreateCategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    try {
      const category = await this.prisma.category.create({
        data: {
          workspaceId,
          name: input.name.trim(),
          type: input.type,
          color: input.color ?? null,
          icon: input.icon ?? null,
          sortOrder: input.sortOrder ?? 0,
        },
      });

      return this.toResponse(category);
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async update(
    workspaceId: string,
    categoryId: string,
    userId: string,
    input: UpdateCategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);

    await this.findCategoryOrThrow(workspaceId, categoryId);

    try {
      const category = await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
          ...(input.type !== undefined ? { type: input.type } : {}),
          ...(input.color !== undefined ? { color: input.color } : {}),
          ...(input.icon !== undefined ? { icon: input.icon } : {}),
          ...(input.sortOrder !== undefined
            ? { sortOrder: input.sortOrder }
            : {}),
        },
      });

      return this.toResponse(category);
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async archive(
    workspaceId: string,
    categoryId: string,
    userId: string,
  ): Promise<CategoryResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    const existing = await this.findCategoryOrThrow(workspaceId, categoryId);

    if (existing.isArchived) {
      return this.toResponse(existing);
    }

    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        isArchived: true,
      },
    });

    return this.toResponse(category);
  }

  async unarchive(
    workspaceId: string,
    categoryId: string,
    userId: string,
  ): Promise<CategoryResponseDto> {
    await this.workspacesService.assertMemberAccess(workspaceId, userId);
    const existing = await this.findCategoryOrThrow(workspaceId, categoryId);

    if (!existing.isArchived) {
      return this.toResponse(existing);
    }

    try {
      const category = await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          isArchived: false,
        },
      });

      return this.toResponse(category);
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  private async findCategoryOrThrow(
    workspaceId: string,
    categoryId: string,
  ): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        workspaceId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category was not found.');
    }

    return category;
  }

  private handleUniqueConstraint(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A category with the same name and type already exists in this workspace.',
      );
    }
  }

  private toResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      workspaceId: category.workspaceId,
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      sortOrder: category.sortOrder,
      isDefault: category.isDefault,
      isArchived: category.isArchived,
    };
  }
}

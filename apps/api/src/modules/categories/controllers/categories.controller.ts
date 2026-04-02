import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateCategoryRequestDto } from '../dto/create-category-request.dto';
import { ListCategoriesQueryDto } from '../dto/list-categories-query.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { UpdateCategoryRequestDto } from '../dto/update-category-request.dto';
import { CategoriesService } from '../services/categories.service';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List workspace categories' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: ListCategoriesQueryDto,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.list(workspaceId, user.userId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a workspace category' })
  @ApiBody({ type: CreateCategoryRequestDto })
  @ApiOkResponse({ type: CategoryResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() input: CreateCategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(workspaceId, user.userId, input);
  }

  @Patch(':categoryId')
  @ApiOperation({ summary: 'Update a workspace category' })
  @ApiBody({ type: UpdateCategoryRequestDto })
  @ApiOkResponse({ type: CategoryResponseDto })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
    @Body() input: UpdateCategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(
      workspaceId,
      categoryId,
      user.userId,
      input,
    );
  }

  @Delete(':categoryId')
  @ApiOperation({ summary: 'Archive a workspace category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.archive(workspaceId, categoryId, user.userId);
  }

  @Post(':categoryId/unarchive')
  @ApiOperation({ summary: 'Unarchive a workspace category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  unarchive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.unarchive(
      workspaceId,
      categoryId,
      user.userId,
    );
  }
}

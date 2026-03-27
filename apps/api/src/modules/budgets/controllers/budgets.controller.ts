import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
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
import { CategoryBudgetListResponseDto } from '../dto/category-budget-list-response.dto';
import { MonthlyBudgetResponseDto } from '../dto/monthly-budget-response.dto';
import { UpsertCategoryBudgetsRequestDto } from '../dto/upsert-category-budgets-request.dto';
import { UpsertMonthlyBudgetRequestDto } from '../dto/upsert-monthly-budget-request.dto';
import { BudgetsService } from '../services/budgets.service';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/budgets/:year/:month')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Put()
  @ApiOperation({ summary: 'Create or update monthly budget' })
  @ApiBody({ type: UpsertMonthlyBudgetRequestDto })
  @ApiOkResponse({ type: MonthlyBudgetResponseDto })
  upsertMonthlyBudget(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() input: UpsertMonthlyBudgetRequestDto,
  ): Promise<MonthlyBudgetResponseDto> {
    return this.budgetsService.upsertMonthlyBudget(
      workspaceId,
      year,
      month,
      user.userId,
      input,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get monthly budget' })
  @ApiOkResponse({ type: MonthlyBudgetResponseDto })
  getMonthlyBudget(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<MonthlyBudgetResponseDto> {
    return this.budgetsService.getMonthlyBudget(
      workspaceId,
      year,
      month,
      user.userId,
    );
  }

  @Put('categories')
  @ApiOperation({ summary: 'Replace category budgets for the month' })
  @ApiBody({ type: UpsertCategoryBudgetsRequestDto })
  @ApiOkResponse({ type: CategoryBudgetListResponseDto })
  upsertCategoryBudgets(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() input: UpsertCategoryBudgetsRequestDto,
  ): Promise<CategoryBudgetListResponseDto> {
    return this.budgetsService.replaceCategoryBudgets(
      workspaceId,
      year,
      month,
      user.userId,
      input,
    );
  }

  @Delete('categories/:categoryId')
  @ApiOperation({ summary: 'Delete one category budget allocation' })
  @ApiOkResponse({ type: CategoryBudgetListResponseDto })
  deleteCategoryBudget(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
  ): Promise<CategoryBudgetListResponseDto> {
    return this.budgetsService.deleteCategoryBudget(
      workspaceId,
      year,
      month,
      categoryId,
      user.userId,
    );
  }
}

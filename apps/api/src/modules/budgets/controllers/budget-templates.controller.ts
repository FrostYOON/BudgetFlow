import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BudgetTemplateResponseDto } from '../dto/budget-template-response.dto';
import { MonthlyBudgetResponseDto } from '../dto/monthly-budget-response.dto';
import { BudgetsService } from '../services/budgets.service';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/budgets')
export class BudgetTemplatesController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get('template')
  @ApiOperation({ summary: 'Get workspace budget template' })
  @ApiOkResponse({ type: BudgetTemplateResponseDto })
  getTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<BudgetTemplateResponseDto> {
    return this.budgetsService.getBudgetTemplate(workspaceId, user.userId);
  }

  @Post(':year/:month/save-template')
  @ApiOperation({ summary: 'Save a month as the workspace budget template' })
  @ApiOkResponse({ type: BudgetTemplateResponseDto })
  saveTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<BudgetTemplateResponseDto> {
    return this.budgetsService.saveTemplateFromMonth(
      workspaceId,
      year,
      month,
      user.userId,
    );
  }

  @Post(':year/:month/apply-template')
  @ApiOperation({ summary: 'Apply workspace budget template to a month' })
  @ApiOkResponse({ type: MonthlyBudgetResponseDto })
  applyTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<MonthlyBudgetResponseDto> {
    return this.budgetsService.applyTemplateToMonth(
      workspaceId,
      year,
      month,
      user.userId,
    );
  }

  @Post(':year/:month/copy-previous')
  @ApiOperation({ summary: 'Copy previous month budget into current month' })
  @ApiOkResponse({ type: MonthlyBudgetResponseDto })
  copyPreviousMonth(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<MonthlyBudgetResponseDto> {
    return this.budgetsService.copyPreviousMonth(
      workspaceId,
      year,
      month,
      user.userId,
    );
  }
}

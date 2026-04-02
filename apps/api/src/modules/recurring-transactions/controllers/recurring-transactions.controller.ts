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
import { CreateRecurringTransactionRequestDto } from '../dto/create-recurring-transaction-request.dto';
import { ExecuteRecurringTransactionsRequestDto } from '../dto/execute-recurring-transactions-request.dto';
import { ExecuteRecurringTransactionsResponseDto } from '../dto/execute-recurring-transactions-response.dto';
import { ListRecurringExecutionRunsQueryDto } from '../dto/list-recurring-execution-runs-query.dto';
import { ListRecurringTransactionsQueryDto } from '../dto/list-recurring-transactions-query.dto';
import { RecurringOpsSummaryResponseDto } from '../dto/recurring-ops-summary-response.dto';
import { RecurringTransactionResponseDto } from '../dto/recurring-transaction-response.dto';
import { RecurringExecutionRunResponseDto } from '../dto/recurring-execution-run-response.dto';
import { RerunRecurringTransactionsRequestDto } from '../dto/rerun-recurring-transactions-request.dto';
import { RerunRecurringTransactionsResponseDto } from '../dto/rerun-recurring-transactions-response.dto';
import { UpdateRecurringTransactionRequestDto } from '../dto/update-recurring-transaction-request.dto';
import { RecurringTransactionExecutionRunsService } from '../services/recurring-transaction-execution-runs.service';
import { RecurringTransactionOpsService } from '../services/recurring-transaction-ops.service';
import { RecurringTransactionsService } from '../services/recurring-transactions.service';

@ApiTags('Recurring Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
    private readonly recurringTransactionExecutionRunsService: RecurringTransactionExecutionRunsService,
    private readonly recurringTransactionOpsService: RecurringTransactionOpsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a recurring transaction' })
  @ApiBody({ type: CreateRecurringTransactionRequestDto })
  @ApiOkResponse({ type: RecurringTransactionResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() input: CreateRecurringTransactionRequestDto,
  ): Promise<RecurringTransactionResponseDto> {
    return this.recurringTransactionsService.create(
      workspaceId,
      user.userId,
      input,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List recurring transactions' })
  @ApiOkResponse({ type: [RecurringTransactionResponseDto] })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: ListRecurringTransactionsQueryDto,
  ): Promise<RecurringTransactionResponseDto[]> {
    return this.recurringTransactionsService.list(
      workspaceId,
      user.userId,
      query,
    );
  }

  @Get('ops')
  @ApiOperation({ summary: 'Get recurring automation operations summary' })
  @ApiOkResponse({ type: RecurringOpsSummaryResponseDto })
  getOpsSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<RecurringOpsSummaryResponseDto> {
    return this.recurringTransactionOpsService.getOpsSummary(
      workspaceId,
      user.userId,
    );
  }

  @Get('execution-runs')
  @ApiOperation({ summary: 'List recurring execution runs' })
  @ApiOkResponse({ type: [RecurringExecutionRunResponseDto] })
  listExecutionRuns(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: ListRecurringExecutionRunsQueryDto,
  ): Promise<RecurringExecutionRunResponseDto[]> {
    return this.recurringTransactionExecutionRunsService.listRuns(
      workspaceId,
      user.userId,
      query.limit,
    );
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute recurring transactions for a month' })
  @ApiBody({ type: ExecuteRecurringTransactionsRequestDto })
  @ApiOkResponse({ type: ExecuteRecurringTransactionsResponseDto })
  execute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() input: ExecuteRecurringTransactionsRequestDto,
  ): Promise<ExecuteRecurringTransactionsResponseDto> {
    return this.recurringTransactionsService.executeMonthly(
      workspaceId,
      user.userId,
      input,
    );
  }

  @Post('execution-runs/rerun')
  @ApiOperation({ summary: 'Rerun recurring execution for a specific date' })
  @ApiBody({ type: RerunRecurringTransactionsRequestDto })
  @ApiOkResponse({ type: RerunRecurringTransactionsResponseDto })
  rerunExecution(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() input: RerunRecurringTransactionsRequestDto,
  ): Promise<RerunRecurringTransactionsResponseDto> {
    return this.recurringTransactionExecutionRunsService.rerunForDate(
      workspaceId,
      user.userId,
      input,
    );
  }

  @Patch(':recurringTransactionId')
  @ApiOperation({ summary: 'Update a recurring transaction' })
  @ApiBody({ type: UpdateRecurringTransactionRequestDto })
  @ApiOkResponse({ type: RecurringTransactionResponseDto })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('recurringTransactionId', new ParseUUIDPipe())
    recurringTransactionId: string,
    @Body() input: UpdateRecurringTransactionRequestDto,
  ): Promise<RecurringTransactionResponseDto> {
    return this.recurringTransactionsService.update(
      workspaceId,
      recurringTransactionId,
      user.userId,
      input,
    );
  }

  @Delete(':recurringTransactionId')
  @ApiOperation({ summary: 'Deactivate a recurring transaction' })
  @ApiOkResponse({ type: RecurringTransactionResponseDto })
  deactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('recurringTransactionId', new ParseUUIDPipe())
    recurringTransactionId: string,
  ): Promise<RecurringTransactionResponseDto> {
    return this.recurringTransactionsService.deactivate(
      workspaceId,
      recurringTransactionId,
      user.userId,
    );
  }
}

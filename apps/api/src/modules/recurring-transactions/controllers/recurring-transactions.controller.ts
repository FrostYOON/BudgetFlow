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
import { ListRecurringTransactionsQueryDto } from '../dto/list-recurring-transactions-query.dto';
import { RecurringTransactionResponseDto } from '../dto/recurring-transaction-response.dto';
import { UpdateRecurringTransactionRequestDto } from '../dto/update-recurring-transaction-request.dto';
import { RecurringTransactionsService } from '../services/recurring-transactions.service';

@ApiTags('Recurring Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
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

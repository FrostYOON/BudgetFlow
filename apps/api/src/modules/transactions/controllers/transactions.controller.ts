import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CreateTransactionRequestDto } from '../dto/create-transaction-request.dto';
import { TransactionListResponseDto } from '../dto/transaction-list-response.dto';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { ListTransactionsQueryDto } from '../dto/list-transactions-query.dto';
import { TransactionsService } from '../services/transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiBody({ type: CreateTransactionRequestDto })
  @ApiOkResponse({ type: TransactionResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() input: CreateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.create(workspaceId, user.userId, input);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions' })
  @ApiOkResponse({ type: TransactionListResponseDto })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    return this.transactionsService.list(workspaceId, user.userId, query);
  }

  @Get(':transactionId')
  @ApiOperation({ summary: 'Get transaction detail' })
  @ApiOkResponse({ type: TransactionResponseDto })
  detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('transactionId', new ParseUUIDPipe()) transactionId: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.detail(
      workspaceId,
      transactionId,
      user.userId,
    );
  }

  @Delete(':transactionId')
  @ApiOperation({ summary: 'Soft-delete a transaction' })
  @ApiOkResponse({ type: TransactionResponseDto })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('transactionId', new ParseUUIDPipe()) transactionId: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.remove(
      workspaceId,
      transactionId,
      user.userId,
    );
  }
}

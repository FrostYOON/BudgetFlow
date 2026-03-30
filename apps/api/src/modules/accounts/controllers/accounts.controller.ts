import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CreateFinancialAccountRequestDto } from '../dto/create-financial-account-request.dto';
import { FinancialAccountResponseDto } from '../dto/financial-account-response.dto';
import { UpdateFinancialAccountRequestDto } from '../dto/update-financial-account-request.dto';
import { AccountsService } from '../services/accounts.service';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List financial accounts' })
  @ApiOkResponse({ type: [FinancialAccountResponseDto] })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<FinancialAccountResponseDto[]> {
    return this.accountsService.list(workspaceId, user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a financial account' })
  @ApiBody({ type: CreateFinancialAccountRequestDto })
  @ApiOkResponse({ type: FinancialAccountResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() input: CreateFinancialAccountRequestDto,
  ): Promise<FinancialAccountResponseDto> {
    return this.accountsService.create(workspaceId, user.userId, input);
  }

  @Patch(':accountId')
  @ApiOperation({ summary: 'Update a financial account' })
  @ApiBody({ type: UpdateFinancialAccountRequestDto })
  @ApiOkResponse({ type: FinancialAccountResponseDto })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('accountId', new ParseUUIDPipe()) accountId: string,
    @Body() input: UpdateFinancialAccountRequestDto,
  ): Promise<FinancialAccountResponseDto> {
    return this.accountsService.update(
      workspaceId,
      accountId,
      user.userId,
      input,
    );
  }

  @Delete(':accountId')
  @ApiOperation({ summary: 'Archive a financial account' })
  @ApiOkResponse({ type: FinancialAccountResponseDto })
  archive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('accountId', new ParseUUIDPipe()) accountId: string,
  ): Promise<FinancialAccountResponseDto> {
    return this.accountsService.archive(workspaceId, accountId, user.userId);
  }
}

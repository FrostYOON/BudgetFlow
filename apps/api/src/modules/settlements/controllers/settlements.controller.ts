import {
  Body,
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
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateSettlementTransferRequestDto } from '../dto/create-settlement-transfer-request.dto';
import { SettlementSummaryResponseDto } from '../dto/settlement-summary-response.dto';
import { SettlementsService } from '../services/settlements.service';

@ApiTags('Settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/settlements/:year/:month')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get monthly settlement summary' })
  @ApiOkResponse({ type: SettlementSummaryResponseDto })
  getMonthlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<SettlementSummaryResponseDto> {
    return this.settlementsService.getMonthlySummary(
      workspaceId,
      year,
      month,
      user.userId,
    );
  }

  @Post('record')
  @ApiOperation({ summary: 'Record a completed settlement transfer' })
  @ApiBody({ type: CreateSettlementTransferRequestDto })
  @ApiOkResponse({ type: SettlementSummaryResponseDto })
  recordTransfer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() input: CreateSettlementTransferRequestDto,
  ): Promise<SettlementSummaryResponseDto> {
    return this.settlementsService.recordTransfer(
      workspaceId,
      year,
      month,
      user.userId,
      input,
    );
  }
}

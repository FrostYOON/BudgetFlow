import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
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
import { MonthlyReportQueryDto } from '../dto/monthly-report-query.dto';
import { MonthlyReportResponseDto } from '../dto/monthly-report-response.dto';
import { ReportsService } from '../services/reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly report' })
  @ApiOkResponse({ type: MonthlyReportResponseDto })
  getMonthlyReport(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: MonthlyReportQueryDto,
  ): Promise<MonthlyReportResponseDto> {
    return this.reportsService.getMonthlyReport(
      workspaceId,
      query.year,
      query.month,
      user.userId,
    );
  }
}

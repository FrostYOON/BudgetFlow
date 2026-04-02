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
import { MonthlyPeriodQueryDto } from '../../../common/dto/monthly-period-query.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MonthlyInsightsResponseDto } from '../dto/monthly-insights-response.dto';
import { InsightsService } from '../services/insights.service';

@ApiTags('Insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly insights' })
  @ApiOkResponse({ type: MonthlyInsightsResponseDto })
  getMonthlyInsights(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: MonthlyPeriodQueryDto,
  ): Promise<MonthlyInsightsResponseDto> {
    return this.insightsService.getMonthlyInsights(
      workspaceId,
      query.year,
      query.month,
      user.userId,
    );
  }
}

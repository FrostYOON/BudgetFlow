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
import { DashboardQueryDto } from '../dto/dashboard-query.dto';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get monthly dashboard summary' })
  @ApiOkResponse({ type: DashboardResponseDto })
  getDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard(
      workspaceId,
      query.year,
      query.month,
      user.userId,
    );
  }
}

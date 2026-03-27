import { Module } from '@nestjs/common';
import { InsightsModule } from '../insights/insights.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [WorkspacesModule, InsightsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

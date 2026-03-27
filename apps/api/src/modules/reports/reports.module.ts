import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

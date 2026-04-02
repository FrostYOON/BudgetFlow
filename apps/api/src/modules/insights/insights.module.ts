import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { InsightsController } from './controllers/insights.controller';
import { InsightsService } from './services/insights.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}

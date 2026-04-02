import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { SettlementsController } from './controllers/settlements.controller';
import { SettlementsService } from './services/settlements.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [SettlementsController],
  providers: [SettlementsService],
  exports: [SettlementsService],
})
export class SettlementsModule {}

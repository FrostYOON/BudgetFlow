import { Module } from '@nestjs/common';
import { SettlementsModule } from '../settlements/settlements.module';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [SettlementsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

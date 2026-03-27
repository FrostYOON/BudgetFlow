import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { RecurringTransactionsController } from './controllers/recurring-transactions.controller';
import { RecurringTransactionsSchedulerService } from './services/recurring-transactions-scheduler.service';
import { RecurringTransactionsService } from './services/recurring-transactions.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [RecurringTransactionsController],
  providers: [
    RecurringTransactionsService,
    RecurringTransactionsSchedulerService,
  ],
})
export class RecurringTransactionsModule {}

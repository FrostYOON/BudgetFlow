import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { RecurringTransactionsController } from './controllers/recurring-transactions.controller';
import { RecurringExecutionFailureNotificationsService } from './services/recurring-execution-failure-notifications.service';
import { RecurringTransactionExecutionRunsService } from './services/recurring-transaction-execution-runs.service';
import { RecurringTransactionOpsService } from './services/recurring-transaction-ops.service';
import { RecurringTransactionsSchedulerService } from './services/recurring-transactions-scheduler.service';
import { RecurringTransactionsService } from './services/recurring-transactions.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [RecurringTransactionsController],
  providers: [
    RecurringTransactionsService,
    RecurringExecutionFailureNotificationsService,
    RecurringTransactionExecutionRunsService,
    RecurringTransactionOpsService,
    RecurringTransactionsSchedulerService,
  ],
})
export class RecurringTransactionsModule {}

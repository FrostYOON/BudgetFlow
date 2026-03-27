import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { RecurringTransactionsController } from './controllers/recurring-transactions.controller';
import { RecurringTransactionExecutionRunsService } from './services/recurring-transaction-execution-runs.service';
import { RecurringTransactionsSchedulerService } from './services/recurring-transactions-scheduler.service';
import { RecurringTransactionsService } from './services/recurring-transactions.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [RecurringTransactionsController],
  providers: [
    RecurringTransactionsService,
    RecurringTransactionExecutionRunsService,
    RecurringTransactionsSchedulerService,
  ],
})
export class RecurringTransactionsModule {}

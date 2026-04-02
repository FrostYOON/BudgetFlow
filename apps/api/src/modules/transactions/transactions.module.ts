import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { TransactionsController } from './controllers/transactions.controller';
import { TransactionsService } from './services/transactions.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}

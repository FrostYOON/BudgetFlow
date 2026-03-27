import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { RecurringTransactionsModule } from './modules/recurring-transactions/recurring-transactions.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';

@Module({
  imports: [
    CoreModule,
    HealthModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    DashboardModule,
    RecurringTransactionsModule,
  ],
})
export class AppModule {}

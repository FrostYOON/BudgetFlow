import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { InsightsModule } from './modules/insights/insights.module';
import { RecurringTransactionsModule } from './modules/recurring-transactions/recurring-transactions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CoreModule,
    HealthModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    InsightsModule,
    DashboardModule,
    RecurringTransactionsModule,
    ReportsModule,
  ],
})
export class AppModule {}

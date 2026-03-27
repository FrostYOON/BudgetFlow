import { ApiProperty } from '@nestjs/swagger';

export class DashboardPeriodDto {
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 3 })
  month!: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ example: '3500000.00' })
  totalIncome!: string;

  @ApiProperty({ example: '1250000.00' })
  totalExpense!: string;

  @ApiProperty({ example: '980000.00' })
  sharedExpense!: string;

  @ApiProperty({ example: '270000.00' })
  personalExpense!: string;

  @ApiProperty({ example: '2000000.00' })
  monthlyBudget!: string;

  @ApiProperty({ example: '1200000.00' })
  allocatedBudget!: string;

  @ApiProperty({ example: '800000.00' })
  unallocatedBudget!: string;

  @ApiProperty({ example: '750000.00' })
  remainingBudget!: string;
}

export class DashboardTopCategoryDto {
  @ApiProperty()
  categoryId!: string;

  @ApiProperty({ example: 'Groceries' })
  name!: string;

  @ApiProperty({ example: '420000.00' })
  amount!: string;
}

export class DashboardRecentTransactionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '52000.00' })
  amount!: string;

  @ApiProperty({ required: false, nullable: true, example: 'Groceries' })
  categoryName!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Jisu' })
  paidByName!: string | null;
}

export class DashboardInsightDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'BUDGET_WARNING' })
  type!: string;

  @ApiProperty({ example: 'Groceries reached 70% of budget' })
  title!: string;

  @ApiProperty({ example: 'Spending is rising faster than last month.' })
  body!: string;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardPeriodDto })
  period!: DashboardPeriodDto;

  @ApiProperty({ type: DashboardSummaryDto })
  summary!: DashboardSummaryDto;

  @ApiProperty({ type: [DashboardTopCategoryDto] })
  topCategories!: DashboardTopCategoryDto[];

  @ApiProperty({ type: [DashboardRecentTransactionDto] })
  recentTransactions!: DashboardRecentTransactionDto[];

  @ApiProperty({ type: [DashboardInsightDto] })
  insights!: DashboardInsightDto[];
}

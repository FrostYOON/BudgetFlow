import { ApiProperty } from '@nestjs/swagger';
import { InsightResponseDto } from '../../../common/dto/insight-response.dto';

export class MonthlyReportSummaryDto {
  @ApiProperty({ example: '3500000.00' })
  totalIncome!: string;

  @ApiProperty({ example: '1250000.00' })
  totalExpense!: string;

  @ApiProperty({ example: '2250000.00' })
  netAmount!: string;

  @ApiProperty({ example: '980000.00' })
  sharedExpense!: string;

  @ApiProperty({ example: '270000.00' })
  personalExpense!: string;

  @ApiProperty({ example: '2000000.00' })
  monthlyBudget!: string;

  @ApiProperty({ example: '750000.00' })
  remainingBudget!: string;
}

export class MonthlyReportCategoryBreakdownItemDto {
  @ApiProperty()
  categoryId!: string;

  @ApiProperty({ example: 'Groceries' })
  name!: string;

  @ApiProperty({ example: '420000.00' })
  amount!: string;

  @ApiProperty({ example: 12 })
  transactionCount!: number;
}

export class MonthlyReportPayerBreakdownItemDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ example: 'Jisu' })
  name!: string;

  @ApiProperty({ example: '750000.00' })
  amount!: string;

  @ApiProperty({ example: 8 })
  transactionCount!: number;
}

export class MonthlyReportBudgetProgressItemDto {
  @ApiProperty()
  categoryId!: string;

  @ApiProperty({ example: 'Groceries' })
  categoryName!: string;

  @ApiProperty({ example: '600000.00' })
  plannedAmount!: string;

  @ApiProperty({ example: '420000.00' })
  actualAmount!: string;

  @ApiProperty({ example: '180000.00' })
  remainingAmount!: string;

  @ApiProperty({ example: 70 })
  progressPct!: number;
}

export class MonthlyReportRecurringUpcomingItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Netflix' })
  memo!: string | null;

  @ApiProperty({ example: '55000.00' })
  amount!: string;

  @ApiProperty({ required: false, nullable: true, example: 'Subscriptions' })
  categoryName!: string | null;

  @ApiProperty({ example: '2026-03-25' })
  nextOccurrenceDate!: string;
}

export class MonthlyReportResponseDto {
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 3 })
  month!: number;

  @ApiProperty({ type: MonthlyReportSummaryDto })
  summary!: MonthlyReportSummaryDto;

  @ApiProperty({ type: [MonthlyReportCategoryBreakdownItemDto] })
  categoryBreakdown!: MonthlyReportCategoryBreakdownItemDto[];

  @ApiProperty({ type: [MonthlyReportPayerBreakdownItemDto] })
  payerBreakdown!: MonthlyReportPayerBreakdownItemDto[];

  @ApiProperty({ type: [MonthlyReportBudgetProgressItemDto] })
  budgetProgress!: MonthlyReportBudgetProgressItemDto[];

  @ApiProperty({ type: [MonthlyReportRecurringUpcomingItemDto] })
  recurringUpcoming!: MonthlyReportRecurringUpcomingItemDto[];

  @ApiProperty({ type: [InsightResponseDto] })
  insights!: InsightResponseDto[];
}

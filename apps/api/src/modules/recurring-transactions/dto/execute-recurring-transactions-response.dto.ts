import { ApiProperty } from '@nestjs/swagger';

export class ExecutedRecurringTransactionItemDto {
  @ApiProperty()
  recurringTransactionId!: string;

  @ApiProperty()
  transactionId!: string | null;

  @ApiProperty({ example: '2026-04-25' })
  transactionDate!: string;

  @ApiProperty({ required: false, nullable: true, example: 'Netflix' })
  memo!: string | null;

  @ApiProperty({ example: '55000.00' })
  amount!: string;

  @ApiProperty({ example: false })
  skipped!: boolean;

  @ApiProperty({ required: false, nullable: true, example: 'already_exists' })
  skipReason!: string | null;
}

export class ExecuteRecurringTransactionsSummaryDto {
  @ApiProperty({ example: 3 })
  candidateCount!: number;

  @ApiProperty({ example: 2 })
  createdCount!: number;

  @ApiProperty({ example: 1 })
  skippedCount!: number;
}

export class ExecuteRecurringTransactionsResponseDto {
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 4 })
  month!: number;

  @ApiProperty({ example: false })
  dryRun!: boolean;

  @ApiProperty({ type: ExecuteRecurringTransactionsSummaryDto })
  summary!: ExecuteRecurringTransactionsSummaryDto;

  @ApiProperty({ type: [ExecutedRecurringTransactionItemDto] })
  items!: ExecutedRecurringTransactionItemDto[];
}

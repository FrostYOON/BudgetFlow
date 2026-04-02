import { ApiProperty } from '@nestjs/swagger';
import { RecurringExecutionRunResponseDto } from './recurring-execution-run-response.dto';

export class RecurringOpsSchedulerDto {
  @ApiProperty({ example: true })
  enabled!: boolean;

  @ApiProperty({ example: '5,20,35,50 * * * *' })
  cron!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  workspaceTimezone!: string;

  @ApiProperty({ example: '2026-03-26' })
  currentLocalDate!: string;

  @ApiProperty({ example: '2026-03-27' })
  nextTargetDate!: string;
}

export class RecurringOpsTransactionCountDto {
  @ApiProperty({ example: 8 })
  activeCount!: number;

  @ApiProperty({ example: 2 })
  inactiveCount!: number;
}

export class RecurringOpsRunStatsDto {
  @ApiProperty({ example: 7 })
  totalRuns!: number;

  @ApiProperty({ example: 6 })
  successRuns!: number;

  @ApiProperty({ example: 1 })
  failedRuns!: number;

  @ApiProperty({ example: 18 })
  createdTransactions!: number;

  @ApiProperty({ example: 4 })
  skippedTransactions!: number;
}

export class RecurringOpsSummaryResponseDto {
  @ApiProperty({ type: RecurringOpsSchedulerDto })
  scheduler!: RecurringOpsSchedulerDto;

  @ApiProperty({ type: RecurringOpsTransactionCountDto })
  recurringTransactions!: RecurringOpsTransactionCountDto;

  @ApiProperty({ type: RecurringOpsRunStatsDto })
  last7Days!: RecurringOpsRunStatsDto;

  @ApiProperty({
    type: RecurringExecutionRunResponseDto,
    required: false,
    nullable: true,
  })
  lastRun!: RecurringExecutionRunResponseDto | null;

  @ApiProperty({
    type: RecurringExecutionRunResponseDto,
    required: false,
    nullable: true,
  })
  lastSuccessfulRun!: RecurringExecutionRunResponseDto | null;

  @ApiProperty({
    type: RecurringExecutionRunResponseDto,
    required: false,
    nullable: true,
  })
  lastFailedRun!: RecurringExecutionRunResponseDto | null;

  @ApiProperty({ type: [RecurringExecutionRunResponseDto] })
  recentFailures!: RecurringExecutionRunResponseDto[];
}

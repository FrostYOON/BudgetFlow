import { ApiProperty } from '@nestjs/swagger';
import { ExecuteRecurringTransactionsResponseDto } from './execute-recurring-transactions-response.dto';
import { RecurringExecutionRunResponseDto } from './recurring-execution-run-response.dto';

export class RerunRecurringTransactionsResponseDto {
  @ApiProperty({
    type: RecurringExecutionRunResponseDto,
    required: false,
    nullable: true,
  })
  run!: RecurringExecutionRunResponseDto | null;

  @ApiProperty({ type: ExecuteRecurringTransactionsResponseDto })
  result!: ExecuteRecurringTransactionsResponseDto;
}

import {
  RecurringExecutionRunStatus,
  RecurringExecutionTriggerType,
} from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';

export class RecurringExecutionRunResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  workspaceId!: string;

  @ApiProperty({
    enum: RecurringExecutionTriggerType,
    example: RecurringExecutionTriggerType.MANUAL,
  })
  triggerType!: RecurringExecutionTriggerType;

  @ApiProperty({
    enum: RecurringExecutionRunStatus,
    example: RecurringExecutionRunStatus.SUCCESS,
  })
  status!: RecurringExecutionRunStatus;

  @ApiProperty({ example: '2026-03-25' })
  targetDate!: string;

  @ApiProperty({ required: false, nullable: true })
  initiatedByUserId!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Minji' })
  initiatedByUserName!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 5 })
  candidateCount!: number | null;

  @ApiProperty({ required: false, nullable: true, example: 4 })
  createdCount!: number | null;

  @ApiProperty({ required: false, nullable: true, example: 1 })
  skippedCount!: number | null;

  @ApiProperty({ required: false, nullable: true })
  errorMessage!: string | null;

  @ApiProperty()
  startedAt!: string;

  @ApiProperty({ required: false, nullable: true })
  finishedAt!: string | null;
}

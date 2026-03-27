import {
  RecurringRepeatUnit,
  TransactionType,
  TransactionVisibility,
} from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';

export class RecurringTransactionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  workspaceId!: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  type!: TransactionType;

  @ApiProperty({
    enum: TransactionVisibility,
    example: TransactionVisibility.SHARED,
  })
  visibility!: TransactionVisibility;

  @ApiProperty({ example: '55000.00' })
  amount!: string;

  @ApiProperty({ example: 'KRW' })
  currency!: string;

  @ApiProperty({ required: false, nullable: true })
  categoryId!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Subscriptions' })
  categoryName!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Netflix' })
  memo!: string | null;

  @ApiProperty({ required: false, nullable: true })
  paidByUserId!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Jisu' })
  paidByUserName!: string | null;

  @ApiProperty({
    enum: RecurringRepeatUnit,
    example: RecurringRepeatUnit.MONTHLY,
  })
  repeatUnit!: RecurringRepeatUnit;

  @ApiProperty({ example: 1 })
  repeatInterval!: number;

  @ApiProperty({ required: false, nullable: true, example: 25 })
  dayOfMonth!: number | null;

  @ApiProperty({ required: false, nullable: true, example: 1 })
  dayOfWeek!: number | null;

  @ApiProperty({ example: '2026-03-25' })
  startDate!: string;

  @ApiProperty({ required: false, nullable: true, example: '2026-12-25' })
  endDate!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdByUserId!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

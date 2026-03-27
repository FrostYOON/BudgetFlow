import {
  RecurringRepeatUnit,
  TransactionType,
  TransactionVisibility,
} from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateRecurringTransactionRequestDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    enum: TransactionVisibility,
    example: TransactionVisibility.SHARED,
  })
  @IsEnum(TransactionVisibility)
  visibility!: TransactionVisibility;

  @ApiProperty({ example: '55000.00' })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  amount!: string;

  @ApiProperty({ example: 'KRW' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'Netflix', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  memo?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  paidByUserId?: string;

  @ApiProperty({
    enum: RecurringRepeatUnit,
    example: RecurringRepeatUnit.MONTHLY,
  })
  @IsEnum(RecurringRepeatUnit)
  repeatUnit!: RecurringRepeatUnit;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Max(365)
  repeatInterval!: number;

  @ApiProperty({ required: false, example: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiProperty({ example: '2026-03-25' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ required: false, example: '2026-12-25' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

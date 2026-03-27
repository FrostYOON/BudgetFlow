import {
  RecurringRepeatUnit,
  TransactionType,
  TransactionVisibility,
} from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
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

export class UpdateRecurringTransactionRequestDto {
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({
    enum: TransactionVisibility,
    example: TransactionVisibility.SHARED,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionVisibility)
  visibility?: TransactionVisibility;

  @ApiProperty({ example: '55000.00', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  amount?: string;

  @ApiProperty({ example: 'KRW', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiProperty({ required: false, format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'Netflix', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  memo?: string;

  @ApiProperty({ required: false, format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  paidByUserId?: string;

  @ApiProperty({
    enum: RecurringRepeatUnit,
    example: RecurringRepeatUnit.MONTHLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(RecurringRepeatUnit)
  repeatUnit?: RecurringRepeatUnit;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  repeatInterval?: number;

  @ApiProperty({ required: false, example: 25, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({ required: false, example: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiProperty({ required: false, example: '2026-03-25' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2026-12-25', nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

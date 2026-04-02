import {
  RecurringRepeatUnit,
  TransactionType,
  TransactionVisibility,
} from '@budgetflow/database';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class ListRecurringTransactionsQueryDto {
  @ApiPropertyOptional({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    enum: TransactionVisibility,
    example: TransactionVisibility.SHARED,
  })
  @IsOptional()
  @IsEnum(TransactionVisibility)
  visibility?: TransactionVisibility;

  @ApiPropertyOptional({
    enum: RecurringRepeatUnit,
    example: RecurringRepeatUnit.MONTHLY,
  })
  @IsOptional()
  @IsEnum(RecurringRepeatUnit)
  repeatUnit?: RecurringRepeatUnit;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class RerunRecurringTransactionsRequestDto {
  @ApiProperty({ example: '2026-03-25' })
  @IsDateString()
  executionDate!: string;

  @ApiProperty({ required: false, default: false })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  dryRun?: boolean;
}

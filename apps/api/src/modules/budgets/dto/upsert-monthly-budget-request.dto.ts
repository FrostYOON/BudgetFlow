import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class UpsertMonthlyBudgetRequestDto {
  @ApiProperty({ example: '2000000.00' })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  totalBudgetAmount!: string;
}

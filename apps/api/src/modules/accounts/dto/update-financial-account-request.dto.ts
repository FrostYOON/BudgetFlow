import { FinancialAccountType } from '@budgetflow/database';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateFinancialAccountRequestDto {
  @ApiPropertyOptional({ example: 'Main Checking' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  name?: string;

  @ApiPropertyOptional({
    enum: FinancialAccountType,
    example: FinancialAccountType.CHECKING,
  })
  @IsOptional()
  @IsEnum(FinancialAccountType)
  type?: FinancialAccountType;

  @ApiPropertyOptional({ example: 'CAD' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiPropertyOptional({ example: 'TD Bank' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  institutionName?: string | null;

  @ApiPropertyOptional({ example: '1234' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/)
  lastFour?: string | null;
}

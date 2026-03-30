import { FinancialAccountType } from '@budgetflow/database';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateFinancialAccountRequestDto {
  @ApiProperty({ example: 'Main Checking' })
  @IsString()
  @Length(2, 80)
  name!: string;

  @ApiProperty({
    enum: FinancialAccountType,
    example: FinancialAccountType.CHECKING,
  })
  @IsEnum(FinancialAccountType)
  type!: FinancialAccountType;

  @ApiProperty({ example: 'CAD' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiPropertyOptional({ example: 'TD Bank' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  institutionName?: string;

  @ApiPropertyOptional({ example: '1234' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/)
  lastFour?: string;
}

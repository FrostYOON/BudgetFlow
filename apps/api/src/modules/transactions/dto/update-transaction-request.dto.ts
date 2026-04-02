import { TransactionVisibility } from '@budgetflow/database';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionParticipantInputDto } from './transaction-participant-input.dto';

export class UpdateTransactionRequestDto {
  @ApiPropertyOptional({
    enum: TransactionVisibility,
    example: TransactionVisibility.SHARED,
  })
  @IsOptional()
  @IsEnum(TransactionVisibility)
  visibility?: TransactionVisibility;

  @ApiPropertyOptional({ example: '52000.00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  amount?: string;

  @ApiPropertyOptional({ example: 'KRW' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiPropertyOptional({ example: '2026-03-24' })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({ required: false, nullable: true, format: 'uuid' })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUUID()
  categoryId?: string | null;

  @ApiPropertyOptional({
    example: 'Mart run',
    required: false,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @Length(1, 500)
  memo?: string | null;

  @ApiPropertyOptional({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  paidByUserId?: string;

  @ApiPropertyOptional({ required: false, nullable: true, format: 'uuid' })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUUID()
  accountId?: string | null;

  @ApiPropertyOptional({
    type: [TransactionParticipantInputDto],
    description: 'Optional split participants for shared expense entries.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionParticipantInputDto)
  participants?: TransactionParticipantInputDto[];
}

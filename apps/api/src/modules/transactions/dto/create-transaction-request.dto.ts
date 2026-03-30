import { TransactionType, TransactionVisibility } from '@budgetflow/database';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionParticipantInputDto } from './transaction-participant-input.dto';

export class CreateTransactionRequestDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    enum: TransactionVisibility,
    example: TransactionVisibility.SHARED,
  })
  @IsEnum(TransactionVisibility)
  visibility!: TransactionVisibility;

  @ApiProperty({ example: '52000.00' })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  amount!: string;

  @ApiProperty({ example: 'KRW' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @ApiProperty({ example: '2026-03-24' })
  @IsDateString()
  transactionDate!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'Mart run', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  memo?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  paidByUserId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

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

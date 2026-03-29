import { ShareType } from '@budgetflow/database';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class TransactionParticipantInputDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ShareType, example: ShareType.EQUAL })
  @IsEnum(ShareType)
  shareType!: ShareType;

  @ApiPropertyOptional({ example: '25.00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  shareValue?: string;
}

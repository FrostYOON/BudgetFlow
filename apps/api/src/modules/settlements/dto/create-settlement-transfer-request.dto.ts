import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, Length, Matches, ValidateIf } from 'class-validator';

export class CreateSettlementTransferRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fromUserId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  toUserId!: string;

  @ApiProperty({ example: '24.50' })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  amount!: string;

  @ApiPropertyOptional({ example: 'March split settled' })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @Length(1, 500)
  memo?: string | null;
}

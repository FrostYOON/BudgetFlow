import { ApiProperty } from '@nestjs/swagger';

export enum InsightSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class InsightResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'MONTHLY_BUDGET_WARNING' })
  type!: string;

  @ApiProperty({ enum: InsightSeverity, example: InsightSeverity.MEDIUM })
  severity!: InsightSeverity;

  @ApiProperty({ example: 'Monthly budget reached 84%' })
  title!: string;

  @ApiProperty({
    example: 'Current spending is 1,680,000 KRW out of 2,000,000 KRW.',
  })
  body!: string;
}

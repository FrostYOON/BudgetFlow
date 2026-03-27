import { ApiProperty } from '@nestjs/swagger';

export class CategoryBudgetResponseDto {
  @ApiProperty({ format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ example: 'Groceries' })
  categoryName!: string;

  @ApiProperty({ example: '600000.00' })
  plannedAmount!: string;

  @ApiProperty({ example: '420000.00' })
  actualAmount!: string;

  @ApiProperty({ example: '180000.00' })
  remainingAmount!: string;

  @ApiProperty({ example: 70 })
  progressPct!: number;

  @ApiProperty({ required: false, nullable: true, example: 80 })
  alertThresholdPct!: number | null;
}

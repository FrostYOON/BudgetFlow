import { ApiProperty } from '@nestjs/swagger';

export class BudgetTemplateCategoryResponseDto {
  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  categoryName!: string;

  @ApiProperty({ example: '250.00' })
  plannedAmount!: string;

  @ApiProperty({ required: false, nullable: true })
  alertThresholdPct!: number | null;
}

export class BudgetTemplateResponseDto {
  @ApiProperty({ required: false, nullable: true })
  id!: string | null;

  @ApiProperty({ required: false, nullable: true })
  name!: string | null;

  @ApiProperty({ example: '2000.00', required: false, nullable: true })
  totalBudgetAmount!: string | null;

  @ApiProperty({ type: [BudgetTemplateCategoryResponseDto] })
  categories!: BudgetTemplateCategoryResponseDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { CategoryBudgetResponseDto } from './category-budget-response.dto';

export class MonthlyBudgetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  workspaceId!: string;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 3 })
  month!: number;

  @ApiProperty({ example: '2000000.00' })
  totalBudgetAmount!: string;

  @ApiProperty({ example: '1200000.00' })
  allocatedAmount!: string;

  @ApiProperty({ example: '800000.00' })
  unallocatedAmount!: string;

  @ApiProperty({ example: '420000.00' })
  actualAmount!: string;

  @ApiProperty({ type: [CategoryBudgetResponseDto] })
  categories!: CategoryBudgetResponseDto[];
}

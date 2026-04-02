import { ApiProperty } from '@nestjs/swagger';
import { CategoryBudgetResponseDto } from './category-budget-response.dto';

export class CategoryBudgetListResponseDto {
  @ApiProperty({ type: [CategoryBudgetResponseDto] })
  categories!: CategoryBudgetResponseDto[];

  @ApiProperty({ example: '1200000.00' })
  allocatedAmount!: string;

  @ApiProperty({ example: '800000.00' })
  unallocatedAmount!: string;
}

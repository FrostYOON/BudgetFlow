import { CategoryType } from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  workspaceId!: string;

  @ApiProperty({ example: 'Groceries' })
  name!: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  type!: CategoryType;

  @ApiProperty({ example: '#4E8B57', required: false, nullable: true })
  color!: string | null;

  @ApiProperty({ example: 'cart', required: false, nullable: true })
  icon!: string | null;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiProperty({ example: false })
  isArchived!: boolean;
}

import { FinancialAccountType } from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';

export class FinancialAccountResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  workspaceId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: FinancialAccountType })
  type!: FinancialAccountType;

  @ApiProperty({ example: 'CAD' })
  currency!: string;

  @ApiProperty({ required: false, nullable: true })
  institutionName!: string | null;

  @ApiProperty({ required: false, nullable: true })
  lastFour!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isArchived!: boolean;

  @ApiProperty()
  createdAt!: string;
}

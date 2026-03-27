import { TransactionType, TransactionVisibility } from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  workspaceId!: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  type!: TransactionType;

  @ApiProperty({
    enum: TransactionVisibility,
    example: TransactionVisibility.SHARED,
  })
  visibility!: TransactionVisibility;

  @ApiProperty({ example: '52000.00' })
  amount!: string;

  @ApiProperty({ example: 'KRW' })
  currency!: string;

  @ApiProperty({ example: '2026-03-24' })
  transactionDate!: string;

  @ApiProperty({ required: false, nullable: true })
  categoryId!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Groceries' })
  categoryName!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Mart run' })
  memo!: string | null;

  @ApiProperty()
  createdByUserId!: string;

  @ApiProperty({ required: false, nullable: true })
  paidByUserId!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Minji' })
  paidByUserName!: string | null;

  @ApiProperty({ example: false })
  isDeleted!: boolean;

  @ApiProperty()
  createdAt!: string;
}

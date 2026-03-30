import { ApiProperty } from '@nestjs/swagger';

export class SettlementBalanceDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: '12.00' })
  netAmount!: string;
}

export class SuggestedSettlementTransferDto {
  @ApiProperty()
  fromUserId!: string;

  @ApiProperty()
  fromName!: string;

  @ApiProperty()
  toUserId!: string;

  @ApiProperty()
  toName!: string;

  @ApiProperty({ example: '12.00' })
  amount!: string;
}

export class CompletedSettlementTransferDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fromUserId!: string;

  @ApiProperty()
  fromName!: string;

  @ApiProperty()
  toUserId!: string;

  @ApiProperty()
  toName!: string;

  @ApiProperty({ example: '12.00' })
  amount!: string;

  @ApiProperty({ example: '2026-03-24T14:00:00.000Z' })
  settledAt!: string;

  @ApiProperty({ required: false, nullable: true })
  memo!: string | null;
}

export class SettlementSummaryResponseDto {
  @ApiProperty({ example: '220.00' })
  totalSharedExpense!: string;

  @ApiProperty({ type: [SettlementBalanceDto] })
  balances!: SettlementBalanceDto[];

  @ApiProperty({ type: [SuggestedSettlementTransferDto] })
  suggestedTransfers!: SuggestedSettlementTransferDto[];

  @ApiProperty({ type: [CompletedSettlementTransferDto] })
  completedTransfers!: CompletedSettlementTransferDto[];
}

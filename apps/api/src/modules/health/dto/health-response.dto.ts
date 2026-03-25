import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'BudgetFlow API' })
  service!: string;

  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '0.1.0' })
  version!: string;

  @ApiProperty({ example: '2026-03-24T15:00:00.000Z' })
  timestamp!: string;
}

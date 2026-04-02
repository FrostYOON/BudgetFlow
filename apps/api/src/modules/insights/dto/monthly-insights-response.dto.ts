import { ApiProperty } from '@nestjs/swagger';
import { InsightResponseDto } from '../../../common/dto/insight-response.dto';

export class MonthlyInsightsResponseDto {
  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 3 })
  month!: number;

  @ApiProperty({ type: [InsightResponseDto] })
  insights!: InsightResponseDto[];
}

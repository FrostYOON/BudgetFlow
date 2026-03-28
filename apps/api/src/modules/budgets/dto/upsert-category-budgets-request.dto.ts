import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryBudgetInputDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: '600000.00' })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  plannedAmount!: string;

  @ApiProperty({ example: 80, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  alertThresholdPct?: number;
}

export class UpsertCategoryBudgetsRequestDto {
  @ApiProperty({ type: [CategoryBudgetInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryBudgetInputDto)
  categories!: CategoryBudgetInputDto[];
}

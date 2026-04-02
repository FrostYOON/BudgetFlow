import { CategoryType } from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateCategoryRequestDto {
  @ApiProperty({ example: 'Groceries', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.EXPENSE,
    required: false,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiProperty({ example: '#4E8B57', required: false, nullable: true })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({ example: 'cart', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  icon?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Min(0)
  @Max(9999)
  sortOrder?: number;
}

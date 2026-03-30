import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class MarkNotificationReadRequestDto {
  @ApiProperty()
  @IsString()
  @Length(4, 200)
  notificationKey!: string;
}

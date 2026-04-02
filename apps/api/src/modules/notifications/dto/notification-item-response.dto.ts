import { ApiProperty } from '@nestjs/swagger';

export class NotificationItemResponseDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ required: false, nullable: true })
  href!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  isRead!: boolean;
}

export class NotificationFeedResponseDto {
  @ApiProperty({ type: [NotificationItemResponseDto] })
  items!: NotificationItemResponseDto[];
}

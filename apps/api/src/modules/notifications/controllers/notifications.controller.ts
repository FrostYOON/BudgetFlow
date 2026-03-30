import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MarkNotificationReadRequestDto } from '../dto/mark-notification-read-request.dto';
import { NotificationFeedResponseDto } from '../dto/notification-item-response.dto';
import { NotificationsService } from '../services/notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification feed' })
  @ApiOkResponse({ type: NotificationFeedResponseDto })
  getFeed(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workspaceId') workspaceId?: string,
  ): Promise<NotificationFeedResponseDto> {
    return this.notificationsService.getFeed(user.userId, workspaceId);
  }

  @Post('read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  @ApiBody({ type: MarkNotificationReadRequestDto })
  @ApiOkResponse({ type: NotificationFeedResponseDto })
  markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: MarkNotificationReadRequestDto,
  ): Promise<NotificationFeedResponseDto> {
    return this.notificationsService.markRead(
      user.userId,
      input.notificationKey,
    );
  }

  @Post('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read for a workspace context',
  })
  @ApiOkResponse({ type: NotificationFeedResponseDto })
  markAllRead(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workspaceId') workspaceId?: string,
  ): Promise<NotificationFeedResponseDto> {
    return this.notificationsService.markAllRead(user.userId, workspaceId);
  }
}

import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserProfileRequestDto } from './dto/update-user-profile-request.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  @ApiBody({ type: UpdateUserProfileRequestDto })
  @ApiOkResponse({ type: UserResponseDto })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateUserProfileRequestDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.userId, input);
  }
}

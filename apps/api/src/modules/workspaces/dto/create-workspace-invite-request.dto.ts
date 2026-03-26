import { WorkspaceMemberRole } from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';

export class CreateWorkspaceInviteRequestDto {
  @ApiProperty({ example: 'jisu@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: WorkspaceMemberRole,
    example: WorkspaceMemberRole.MEMBER,
  })
  @IsEnum(WorkspaceMemberRole)
  role!: WorkspaceMemberRole;
}

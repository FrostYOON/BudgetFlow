import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import {
  AuthIdentityProvider,
  Prisma,
  User,
} from '@budgetflow/database';
import { PrismaService } from '../../core/database/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserProfileRequestDto } from './dto/update-user-profile-request.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByAuthIdentity(
    provider: AuthIdentityProvider,
    providerSubject: string,
  ): Promise<User | null> {
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider,
          providerSubject,
        },
      },
      include: {
        user: true,
      },
    });

    return identity?.user ?? null;
  }

  async create(input: {
    email: string;
    passwordHash?: string | null;
    name: string;
    locale?: string;
    timezone?: string;
    profileImageUrl?: string | null;
  }): Promise<User> {
    const existingUser = await this.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('Email is already in use.');
    }

    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash ?? null,
        name: input.name,
        ...(input.profileImageUrl !== undefined
          ? { profileImageUrl: input.profileImageUrl }
          : {}),
        ...(input.locale ? { locale: input.locale } : {}),
        ...(input.timezone ? { timezone: input.timezone } : {}),
      },
    });
  }

  async linkAuthIdentity(input: {
    userId: string;
    provider: AuthIdentityProvider;
    providerSubject: string;
    email?: string | null;
  }): Promise<void> {
    try {
      await this.prisma.authIdentity.upsert({
        where: {
          provider_providerSubject: {
            provider: input.provider,
            providerSubject: input.providerSubject,
          },
        },
        update: {
          userId: input.userId,
          email: input.email ?? null,
        },
        create: {
          userId: input.userId,
          provider: input.provider,
          providerSubject: input.providerSubject,
          email: input.email ?? null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Authentication identity is already linked.');
      }

      throw error;
    }
  }

  async updateProfile(
    userId: string,
    input: UpdateUserProfileRequestDto,
  ): Promise<UserResponseDto> {
    const hasChanges = Object.values(input).some(
      (value) => value !== undefined,
    );

    if (!hasChanges) {
      throw new BadRequestException('At least one profile field is required.');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.profileImageUrl !== undefined
          ? { profileImageUrl: input.profileImageUrl }
          : {}),
        ...(input.locale !== undefined ? { locale: input.locale } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      },
    });

    return this.toResponse(user);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });
  }

  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      locale: user.locale,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }
}

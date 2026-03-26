import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@budgetflow/database';
import { PrismaService } from '../../core/database/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';

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

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<User> {
    const existingUser = await this.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('Email is already in use.');
    }

    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
      },
    });
  }

  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      locale: user.locale,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }
}

import { Injectable } from '@nestjs/common';
import type { AuthSession } from '@budgetflow/database';
import { PrismaService } from '../../../core/database/prisma.service';
import type { AuthRequestContext } from '../interfaces/auth-request-context.interface';

interface CreateAuthSessionInput extends AuthRequestContext {
  sessionId: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

interface RotateAuthSessionInput extends AuthRequestContext {
  refreshTokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class AuthSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  createSession(input: CreateAuthSessionInput): Promise<AuthSession> {
    return this.prisma.authSession.create({
      data: {
        id: input.sessionId,
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        lastUsedAt: new Date(),
      },
    });
  }

  findSessionById(
    sessionId: string,
    userId: string,
  ): Promise<AuthSession | null> {
    return this.prisma.authSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  async rotateSession(
    sessionId: string,
    userId: string,
    input: RotateAuthSessionInput,
  ): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
      data: {
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        lastUsedAt: new Date(),
      },
    });
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  listSessions(userId: string): Promise<AuthSession[]> {
    return this.prisma.authSession.findMany({
      where: {
        userId,
      },
      orderBy: [
        { revokedAt: 'asc' },
        { lastUsedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async revokeOtherSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(currentSessionId
          ? {
              id: {
                not: currentSessionId,
              },
            }
          : {}),
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

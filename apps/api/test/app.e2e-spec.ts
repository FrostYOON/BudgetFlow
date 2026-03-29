import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryType, WorkspaceType } from '@budgetflow/database';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { AppConfigService } from '../src/core/config/app-config.service';

describe('API onboarding flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService | undefined;
  let apiPrefix: string;
  let refreshCookieName: string;

  beforeAll(async () => {
    process.env.RECURRING_EXECUTION_SCHEDULER_ENABLED = 'false';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const appConfig = app.get(AppConfigService);
    apiPrefix = appConfig.apiPrefix;
    refreshCookieName = appConfig.authRefreshCookieName;

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix(apiPrefix);

    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    if (prisma) {
      await resetDatabase(prisma);
    }

    if (app) {
      await app.close();
    }
  });

  it('returns health status from the root API endpoint', async () => {
    const response = await request(app.getHttpServer())
      .get(`/${apiPrefix}`)
      .expect(200);
    const body = response.body as HealthResponseBody;

    expect(body).toMatchObject({
      service: 'BudgetFlow API',
      status: 'ok',
      version: '0.1.0',
    });
    expect(body.timestamp).toEqual(expect.any(String));
  });

  it('supports sign-up, workspace onboarding, token refresh, and sign-out', async () => {
    const email = `minji-${Date.now()}@example.com`;
    const password = 'Password123!';

    const signUpResponse = await request(app.getHttpServer())
      .post(`/${apiPrefix}/auth/sign-up`)
      .send({
        email,
        password,
        name: 'Minji',
      })
      .expect(201);
    const signUpBody = signUpResponse.body as AuthResponseBody;

    expect(signUpBody.user).toMatchObject({
      email,
      name: 'Minji',
      locale: 'ko-KR',
      timezone: 'Asia/Seoul',
    });
    expect(signUpBody.tokens.accessToken).toEqual(expect.any(String));
    expect(signUpBody.tokens.refreshToken).toBeUndefined();

    const refreshCookie = getCookie(
      signUpResponse.headers['set-cookie'],
      refreshCookieName,
    );
    expect(refreshCookie).toBeDefined();

    const accessToken = signUpBody.tokens.accessToken;

    const meResponse = await request(app.getHttpServer())
      .get(`/${apiPrefix}/auth/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const meBody = meResponse.body as UserResponseBody;

    expect(meBody).toMatchObject({
      email,
      name: 'Minji',
      profileImageUrl: null,
    });

    const updateProfileResponse = await request(app.getHttpServer())
      .patch(`/${apiPrefix}/users/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Minji Kim',
        locale: 'en-US',
        timezone: 'America/Toronto',
        profileImageUrl: 'https://example.com/avatar.png',
      })
      .expect(200);
    const updatedProfile = updateProfileResponse.body as UserResponseBody;

    expect(updatedProfile).toMatchObject({
      email,
      name: 'Minji Kim',
      profileImageUrl: 'https://example.com/avatar.png',
      locale: 'en-US',
      timezone: 'America/Toronto',
    });

    const createWorkspaceResponse = await request(app.getHttpServer())
      .post(`/${apiPrefix}/workspaces`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Minji & Jisu Home',
        type: WorkspaceType.COUPLE,
        baseCurrency: 'KRW',
        timezone: 'Asia/Seoul',
      })
      .expect(201);
    const workspaceBody = createWorkspaceResponse.body as WorkspaceResponseBody;

    expect(workspaceBody).toMatchObject({
      name: 'Minji & Jisu Home',
      type: WorkspaceType.COUPLE,
      baseCurrency: 'KRW',
      timezone: 'Asia/Seoul',
      ownerUserId: meBody.id,
    });

    const listWorkspacesResponse = await request(app.getHttpServer())
      .get(`/${apiPrefix}/workspaces`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const listedWorkspaces =
      listWorkspacesResponse.body as WorkspaceListItemBody[];

    expect(listedWorkspaces).toHaveLength(1);
    expect(listedWorkspaces[0]).toMatchObject({
      id: workspaceBody.id,
      name: 'Minji & Jisu Home',
      type: WorkspaceType.COUPLE,
      baseCurrency: 'KRW',
      timezone: 'Asia/Seoul',
      memberRole: 'OWNER',
    });

    const updateMemberResponse = await request(app.getHttpServer())
      .patch(`/${apiPrefix}/workspaces/${workspaceBody.id}/members/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nickname: 'Mins',
      })
      .expect(200);
    const updatedMember = updateMemberResponse.body as WorkspaceMemberBody;

    expect(updatedMember).toMatchObject({
      userId: meBody.id,
      name: 'Minji Kim',
      nickname: 'Mins',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    const memberListResponse = await request(app.getHttpServer())
      .get(`/${apiPrefix}/workspaces/${workspaceBody.id}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const members = memberListResponse.body as WorkspaceMemberBody[];

    expect(members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: meBody.id,
          nickname: 'Mins',
        }),
      ]),
    );

    const expenseCategoriesResponse = await request(app.getHttpServer())
      .get(`/${apiPrefix}/workspaces/${workspaceBody.id}/categories`)
      .query({ type: CategoryType.EXPENSE })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const expenseCategories = expenseCategoriesResponse.body as CategoryBody[];

    expect(expenseCategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Market',
          type: CategoryType.EXPENSE,
          isDefault: true,
          isArchived: false,
        }),
        expect.objectContaining({
          name: 'Housing',
          type: CategoryType.EXPENSE,
          isDefault: true,
          isArchived: false,
        }),
      ]),
    );

    const incomeCategoriesResponse = await request(app.getHttpServer())
      .get(`/${apiPrefix}/workspaces/${workspaceBody.id}/categories`)
      .query({ type: CategoryType.INCOME })
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const incomeCategories = incomeCategoriesResponse.body as CategoryBody[];

    expect(incomeCategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Salary',
          type: CategoryType.INCOME,
          isDefault: true,
          isArchived: false,
        }),
        expect.objectContaining({
          name: 'Bonus',
          type: CategoryType.INCOME,
          isDefault: true,
          isArchived: false,
        }),
      ]),
    );

    const signInResponse = await request(app.getHttpServer())
      .post(`/${apiPrefix}/auth/sign-in`)
      .send({
        email,
        password,
      })
      .expect(201);
    const signInBody = signInResponse.body as AuthResponseBody;

    const rotatedRefreshCookie = getCookie(
      signInResponse.headers['set-cookie'],
      refreshCookieName,
    );
    expect(rotatedRefreshCookie).toBeDefined();
    expect(signInBody.tokens.accessToken).toEqual(expect.any(String));

    const refreshResponse = await request(app.getHttpServer())
      .post(`/${apiPrefix}/auth/refresh`)
      .set('Cookie', rotatedRefreshCookie!)
      .expect(201);
    const refreshBody = refreshResponse.body as AuthResponseBody;

    expect(refreshBody.user).toMatchObject({
      email,
      name: 'Minji Kim',
      profileImageUrl: 'https://example.com/avatar.png',
    });
    expect(refreshBody.tokens.accessToken).toEqual(expect.any(String));
    expect(refreshResponse.headers['set-cookie']).toEqual(expect.any(Array));

    await request(app.getHttpServer())
      .post(`/${apiPrefix}/auth/sign-out`)
      .set('Authorization', `Bearer ${refreshBody.tokens.accessToken}`)
      .expect(201)
      .expect(({ body, headers }) => {
        expect(body).toEqual({ signedOut: true });
        expect(headers['set-cookie']).toEqual(expect.any(Array));
      });
  });
});

async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.transactionParticipant.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budgetMonth.deleteMany();
  await prisma.recurringExecutionRun.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.workspaceInvite.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.category.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
}

function getCookie(
  setCookieHeader: string[] | undefined,
  cookieName: string,
): string | undefined {
  return setCookieHeader?.find((cookie) => cookie.startsWith(`${cookieName}=`));
}

type HealthResponseBody = {
  service: string;
  status: string;
  version: string;
  timestamp: string;
};

type UserResponseBody = {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string | null;
  locale: string;
  timezone: string;
};

type AuthResponseBody = {
  user: UserResponseBody;
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
};

type WorkspaceResponseBody = {
  id: string;
  name: string;
  type: WorkspaceType;
  baseCurrency: string;
  timezone: string;
  ownerUserId: string;
};

type WorkspaceListItemBody = {
  id: string;
  name: string;
  type: WorkspaceType;
  baseCurrency: string;
  timezone: string;
  memberRole: string;
};

type WorkspaceMemberBody = {
  userId: string;
  name: string;
  nickname: string | null;
  role: string;
  status: string;
};

type CategoryBody = {
  id: string;
  workspaceId: string;
  name: string;
  type: CategoryType;
  sortOrder: number;
  isDefault: boolean;
  isArchived: boolean;
};

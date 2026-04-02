import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppConfigService } from '../../../core/config/app-config.service';

export interface GoogleOAuthProfile {
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
  subject: string;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleOAuthService {
  constructor(private readonly appConfig: AppConfigService) {}

  async exchangeCodeForProfile(input: {
    code: string;
    redirectUri: string;
  }): Promise<GoogleOAuthProfile> {
    const clientId = this.appConfig.googleClientId;
    const clientSecret = this.appConfig.googleClientSecret;

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google sign-in is not configured.');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: input.code,
        grant_type: 'authorization_code',
        redirect_uri: input.redirectUri,
      }),
    });

    const tokenPayload =
      (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenPayload.access_token) {
      throw new UnauthorizedException(
        tokenPayload.error_description ?? 'Google sign-in failed.',
      );
    }

    const userInfoResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
        },
      },
    );
    const userInfoPayload =
      (await userInfoResponse.json()) as GoogleUserInfoResponse;

    if (
      !userInfoResponse.ok ||
      !userInfoPayload.sub ||
      !userInfoPayload.email ||
      !userInfoPayload.email_verified
    ) {
      throw new UnauthorizedException(
        'Google account email could not be verified.',
      );
    }

    return {
      email: userInfoPayload.email,
      emailVerified: userInfoPayload.email_verified,
      name:
        userInfoPayload.name?.trim() ||
        userInfoPayload.email.split('@')[0] ||
        'BudgetFlow User',
      picture: userInfoPayload.picture ?? null,
      subject: userInfoPayload.sub,
    };
  }
}

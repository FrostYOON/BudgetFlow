import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../core/config/app-config.service';
import { AppLoggerService } from '../../../core/logger/app-logger.service';

@Injectable()
export class WorkspaceInviteEmailService {
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  async sendInviteEmail(input: {
    recipientEmail: string;
    workspaceName: string;
    inviteToken: string;
    inviterName?: string | null;
  }): Promise<void> {
    if (
      !this.appConfig.resendApiKey ||
      !this.appConfig.inviteEmailFrom ||
      !this.appConfig.appWebUrl
    ) {
      this.logger.warn(
        'Skipped workspace invite email send because email delivery is not configured',
        WorkspaceInviteEmailService.name,
        {
          hasAppWebUrl: Boolean(this.appConfig.appWebUrl),
          hasInviteEmailFrom: Boolean(this.appConfig.inviteEmailFrom),
          hasResendApiKey: Boolean(this.appConfig.resendApiKey),
          recipientEmail: input.recipientEmail,
          workspaceName: input.workspaceName,
        },
      );

      return;
    }

    const inviteUrl = new URL(
      `/join/${input.inviteToken}`,
      this.appConfig.appWebUrl,
    ).toString();
    const inviterLabel = input.inviterName?.trim() || 'A BudgetFlow owner';
    const subject = `${inviterLabel} invited you to ${input.workspaceName}`;
    const text = [
      `${inviterLabel} invited you to join "${input.workspaceName}" on BudgetFlow.`,
      '',
      `Open this invite: ${inviteUrl}`,
      '',
      'If you already have an account, sign in with the invited email address before accepting the invite.',
    ].join('\n');
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#059669;font-weight:700;margin:0 0 16px">BudgetFlow Shared Space</p>
        <h1 style="font-size:24px;line-height:1.2;margin:0 0 16px">Join ${this.escapeHtml(input.workspaceName)}</h1>
        <p style="margin:0 0 16px">${this.escapeHtml(inviterLabel)} invited you to collaborate in a shared budget workspace on BudgetFlow.</p>
        <p style="margin:24px 0">
          <a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#10b981;color:#042f2e;text-decoration:none;font-weight:700">
            Open invite
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:14px;color:#475569">If the button does not work, use this link:</p>
        <p style="margin:0;font-size:14px;word-break:break-all"><a href="${inviteUrl}" style="color:#0f766e">${inviteUrl}</a></p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.appConfig.resendApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'budgetflow-api/0.1.0',
      },
      body: JSON.stringify({
        from: this.appConfig.inviteEmailFrom,
        to: [input.recipientEmail],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => '');

      this.logger.warn(
        'Workspace invite email send failed',
        WorkspaceInviteEmailService.name,
        {
          recipientEmail: input.recipientEmail,
          responseText,
          status: response.status,
        },
      );
    }
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string | null;
  locale: string;
  timezone: string;
  createdAt: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  type: string;
  baseCurrency: string;
  timezone: string;
  memberRole: string;
}

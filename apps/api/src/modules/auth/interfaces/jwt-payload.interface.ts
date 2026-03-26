export interface JwtPayload {
  sub: string;
  email: string;
  sessionId: string;
  tokenType: 'access' | 'refresh';
}

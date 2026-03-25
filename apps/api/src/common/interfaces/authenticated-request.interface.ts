import { RequestWithContext } from './request-with-context.interface';

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends RequestWithContext {
  user?: AuthenticatedUser;
}

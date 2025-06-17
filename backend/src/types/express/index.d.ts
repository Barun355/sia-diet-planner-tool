import { RoleType } from ".";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: RoleType;
      };
    }
  }
}

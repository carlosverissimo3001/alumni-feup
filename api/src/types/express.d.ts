import { Alumni, Permission } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Alumni & { Permissions: Permission[] };
    }
  }
}

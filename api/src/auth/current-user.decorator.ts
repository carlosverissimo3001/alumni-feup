import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// UserAuthGuard already resolves and attaches the user to the request on any
// route with @RequirePermission; this just reads it back out.
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);

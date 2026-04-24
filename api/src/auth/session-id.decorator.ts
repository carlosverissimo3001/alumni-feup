import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SESSION_COOKIE_NAME } from './session.service';

export const SessionId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as
      | string
      | undefined;

    if (!sessionId) {
      throw new UnauthorizedException('Not authenticated');
    }

    return sessionId;
  },
);

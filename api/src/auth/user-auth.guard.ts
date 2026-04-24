import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { Permission } from '@prisma/client';
import { Reflector } from '@nestjs/core';
import { SessionService, SESSION_COOKIE_NAME } from './session.service';

// Decorator for setting required permissions on routes
export const RequirePermission = (resource: string, action: string) =>
  SetMetadata('permission', { resource, action });

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<{ resource: string; action: string }>(
      'permission',
      context.getHandler(),
    );

    // If no permission is required, allow access
    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.[SESSION_COOKIE_NAME] as
      | string
      | undefined;

    if (!sessionId) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Resolve user from session (server-side — no client-supplied identity)
    const session = await this.sessionService.getSession(sessionId);

    // Refresh TTL on activity
    await this.sessionService.refreshSession(sessionId);

    // Get the user with permissions from database
    const user = await this.prisma.alumni.findUnique({
      where: { id: session.userId },
      include: {
        Permissions: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user has the required permission
    const hasPermission = user.Permissions.some(
      (p: Permission) =>
        p.resource === permission.resource &&
        p.actions.includes(permission.action),
    );

    if (!hasPermission) {
      throw new UnauthorizedException(
        `User does not have ${permission.action} permission for ${permission.resource}`,
      );
    }

    // Add user to request for use in controllers
    request.user = user;
    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Permission } from '@prisma/client';
import { Reflector } from '@nestjs/core';

// Create metadata keys for permission checking
export const RESOURCE_KEY = 'resource';
export const ACTION_KEY = 'action';

// Decorator for setting required permissions on routes
export const RequirePermission = (resource: string, action: string) =>
  SetMetadata('permission', { resource, action });

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the required permission from route metadata
    const permission = this.reflector.get<{ resource: string; action: string }>(
      'permission',
      context.getHandler(),
    );

    // If no permission is required, allow access
    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.headers['x-user-id'] as string;

    if (!userId) {
      throw new UnauthorizedException('User ID is missing');
    }

    // Get the user with permissions from database
    const user = await this.prisma.alumni.findUnique({
      where: { id: userId },
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
    (request as any).user = user;
    return true;
  }
}

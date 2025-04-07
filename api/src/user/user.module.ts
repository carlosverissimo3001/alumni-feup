import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, Logger],
})
export class UserModule {}

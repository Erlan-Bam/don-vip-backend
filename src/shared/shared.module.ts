import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from './services/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule, JwtModule],
  providers: [JwtStrategy, PrismaService, JwtService, ConfigService],
  exports: [
    JwtStrategy,
    PrismaService,
    JwtService,
    ConfigModule,
    ConfigService,
  ],
})
export class SharedModule {}

import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from './services/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule,
  ],
  providers: [
    JwtStrategy,
    PrismaService,
    JwtService,
    ConfigService,
    EmailService,
  ],
  exports: [
    JwtStrategy,
    PrismaService,
    JwtService,
    ConfigModule,
    ConfigService,
    EmailService,
  ],
})
export class SharedModule {}

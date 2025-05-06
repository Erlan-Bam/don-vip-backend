import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedModule } from 'src/shared/shared.module';
import { UserService } from 'src/user/user.service';
import { GoogleStrategy } from 'src/shared/strategies/google.strategy';

@Module({
  imports: [SharedModule],
  providers: [AuthService, UserService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

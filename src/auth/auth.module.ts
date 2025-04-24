import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedModule } from 'src/shared/shared.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [SharedModule],
  providers: [AuthService, UserService],
  controllers: [AuthController],
})
export class AuthModule {}

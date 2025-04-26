import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset password for authenticated user' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() data: ResetPasswordDto, @Request() request) {
    data.identifier = request.user.identifier;
    return this.userService.resetPassword(data);
  }
}

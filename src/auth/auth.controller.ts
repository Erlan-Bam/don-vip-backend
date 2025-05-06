import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  baseFrontendUrl: string;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.baseFrontendUrl =
      this.configService.get<string>('NODE_ENV') === 'development'
        ? 'http://localhost:3000'
        : '';
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user with email or phone and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Tokens issued' })
  async login(@Body() data: LoginDto) {
    const tokens = await this.authService.login(data);
    return {
      id: tokens.userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user with email or phone and password' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Tokens issued after registration' })
  async register(@Body() data: RegisterDto) {
    const tokens = await this.authService.register(data);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'New access token' })
  async refresh(@Body() body: { token: string }) {
    const newAccessToken = await this.authService.refreshAccessToken(
      body.token,
    );
    return { access_token: newAccessToken };
  }

  @ApiOperation({ summary: 'Send password reset email' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @Post('change-password')
  async changePassword(@Body() data: ChangePasswordDto) {
    return await this.authService.changePassword(data);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Request() request, @Response() response) {
    try {
      const tokens = await this.authService.validateOAuth(request.user);
      console.log(tokens);
      return response.redirect(
        `${this.baseFrontendUrl}/google?access=${tokens.access_token}&refresh=${tokens.refresh_token}`,
      );
    } catch (error) {
      console.log(error);
      return response.redirect(`${this.baseFrontendUrl}/register`);
    }
  }
}

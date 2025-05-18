import { HttpException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from 'src/shared/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}
  async register(data: RegisterDto) {
    let user = await this.userService.findById(data.id);
    if (!user) {
      user = await this.userService.createUser(data);
    } else {
      const code = await this.generateCode();
      user = await this.userService.updateToUser(
        data.id,
        data.identifier,
        data.password,
        code,
      );
      await this.emailService.sendVerificationEmail(
        data.identifier,
        data.lang,
        code,
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  async createGuest() {
    const user = await this.prisma.user.create({ data: {} as any });
    return user;
  }
  async login(data: LoginDto) {
    const user = await this.userService.findByIdentifier(data.identifier);
    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    const isMatch = await this.userService.validatePassword(
      data.password,
      user.password,
    );
    if (!isMatch) {
      throw new HttpException('Invalid password', 400);
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return {
      userId: user.id,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  async validateOAuth(profile: any) {
    let user = await this.prisma.user.findUnique({
      where: { identifier: profile.email },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          identifier: profile.email,
          password: '',
        },
      });
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  async changePassword(data: ChangePasswordDto) {
    const user = await this.userService.findByIdentifier(data.email);

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const token = await this.generateAccessToken(user);
    const resetLink = `https://don-vip.com/reset-password?token=${token}`;

    await this.emailService.sendChangePasswordEmail(
      data.email,
      resetLink,
      data.lang,
    );

    return { message: 'Form sent successfully' };
  }
  async generateAccessToken(user: User): Promise<string> {
    return await this.jwtService.signAsync(
      {
        id: user.id,
        identifier: user.identifier,
        role: user.role,
        is_banned: user.is_banned,
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '1d',
      },
    );
  }
  async generateRefreshToken(user: User): Promise<string> {
    return await this.jwtService.signAsync(
      {
        id: user.id,
        identifier: user.identifier,
        role: user.role,
        is_banned: user.is_banned,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }
  async generateCode() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    return code;
  }
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.userService.findByIdentifier(payload.email);
      if (!user) {
        throw new HttpException('Invalid refresh token', 401);
      }
      return this.generateAccessToken(user);
    } catch (error) {
      throw new HttpException('Invalid refresh token', 401);
    }
  }
}

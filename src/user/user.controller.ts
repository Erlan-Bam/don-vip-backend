import { UserService } from 'src/user/user.service';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Patch,
  UseInterceptors,
  UploadedFile,
  HttpException,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { AdminGuard } from 'src/shared/guards/admin.guards';
import { SetVerifiedDto } from './dto/set-verified.dto';
import * as jwt from 'jsonwebtoken';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth('JWT')
export class UserController {
  private readonly baseUrl: string;
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    this.baseUrl =
      nodeEnv === 'development'
        ? 'http://localhost:6001'
        : 'https://don-vip.online';
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user or by optional userId' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMe(@Request() request, @Query('userId') userId?: number) {
    const id = userId ?? request.user.id;
    return this.userService.findById(id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Find all users (pagination + search)' })
  @ApiResponse({ status: 200, description: 'List of users with pagination' })
  async findAllUsers(
    @Query('search') search?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.userService.findAllUsers({
      search,
      page: page,
      limit: limit,
    });
  }

  @Patch(':id/ban')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Ban a user by ID' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  async banUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.banUser(id);
  }

  @Patch(':id/unban')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Unban a user by ID' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  async unbanUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.unbanUser(id);
  }

  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Reset password for authenticated user' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() data: ResetPasswordDto, @Request() request) {
    data.identifier = request.user.identifier;
    return this.userService.resetPassword(data);
  }

  @Get(':id/payments')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'List of payments for user' })
  async getUserPayments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.userService.getUserPayments(id, page, limit);
  }

  @Patch('update-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile data to update',
    type: UpdateProfileDto,
  })
  async updateProfile(@Body() data: UpdateProfileDto) {
    return this.userService.updateProfile(data);
  }

  @Post('upload-avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          ['image/png', 'image/jpeg', 'image/webp', 'image/svg'].includes(
            file.mimetype,
          )
        ) {
          callback(null, true);
        } else {
          callback(
            new HttpException(
              'Only .png, .jpeg, .svg and .webp formats are allowed!',
              400,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar file',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const avatarUrl = `${this.baseUrl}/uploads/avatars/${file.filename}`;
    return this.userService.updateProfile({
      id: req.user.id,
      avatar: avatarUrl,
    });
  }

  @Get('count')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Get total user count' })
  @ApiResponse({ status: 200, description: 'Total number of users' })
  async getUsersCount() {
    const total = await this.userService.getUsersCount();
    return { total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user' })
  async getUser(@Req() req, @Query('userId') userId?: number) {
    console.log('Received request to get user');
    const authHeader = req.headers['authorization'];
    console.log('Authorization header:', authHeader);

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT verified, user:', req.user);
      } catch (err) {
        req.user = null;
        console.error('JWT verification failed:', err);
      }
    }

    const userIdToFind = req.user?.id ?? userId;
    console.log('User ID to find:', userIdToFind);

    if (!userIdToFind) {
      console.error('userId required but not provided');
      throw new BadRequestException('userId required');
    }
    const user = await this.userService.findById(userIdToFind);
    console.log('Found user:', user);
    return user;
  }

  @Post('verify')
  @ApiOperation({ summary: 'Mark user as verified by identifier' })
  @ApiBody({ type: SetVerifiedDto })
  async setVerified(@Body() data: SetVerifiedDto) {
    return await this.userService.setVerified(data.identifier, data.code);
  }
}

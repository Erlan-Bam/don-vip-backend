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
        : 'https://don-vip.com';
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMe(@Request() request) {
    return this.userService.findById(request.user.id);
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
  @ApiOperation({ summary: 'Reset password for authenticated user' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() data: ResetPasswordDto) {
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
  @Get('/profile/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User data returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Mark user as verified by identifier' })
  @ApiBody({ type: SetVerifiedDto })
  async setVerified(@Body() data: SetVerifiedDto) {
    return await this.userService.setVerified(data.identifier, data.code);
  }
}

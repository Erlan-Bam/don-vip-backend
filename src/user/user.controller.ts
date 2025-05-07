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
        : 'https://don-vip-backend-production.up.railway.app';
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMe(@Request() request) {
    return this.userService.findById(request.user.id);
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
  @Patch('update-profile')
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
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({ summary: 'Update user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile data to update',
    type: UpdateProfileDto,
  })
  async updateProfile(
    @Body() data: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() request,
  ) {
    data.id = request.user.id;
    data.avatar = `${this.baseUrl}/uploads/avatars/${file.filename}`;

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
    const avatarUrl = `https://don-vip-backend-production.up.railway.app/uploads/avatars/${file.filename}`;
    return this.userService.updateProfile({
      id: req.user.id,
      avatar: avatarUrl,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User data returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }
}

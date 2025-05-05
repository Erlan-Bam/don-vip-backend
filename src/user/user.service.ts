import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async createUser(data: RegisterDto) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await this.prisma.user.create({
      data: {
        identifier: data.identifier,
        password: hashedPassword,
      },
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return user;
  }

  async resetPassword(data: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { identifier: data.identifier },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const bcrypt = await import('bcryptjs');
    const isMatch = bcrypt.compare(data.new_password, user.password);
    if (isMatch) {
      throw new HttpException('New password must not match old password', 400);
    }
    const hashedPassword = await bcrypt.hash(data.new_password, 10);
    return await this.prisma.user.update({
      where: { identifier: data.identifier },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        identifier: true,
        role: true,
      },
    });
  }
  async updateProfile(data: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: data.id } });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (user.avatar) {
      try {
        const { unlink } = await import('fs/promises');
        const { join } = await import('path');

        const filename = user.avatar.split('/').pop();
        const filePath = join(process.cwd(), 'uploads', 'avatars', filename);

        await unlink(filePath);
      } catch (err) {}
    }

    return await this.prisma.user.update({
      where: { id: data.id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        avatar: data.avatar,
      },
    });
  }
  async findByIdentifier(identifier: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { identifier: identifier },
    });
  }
  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const bcrypt = await import('bcryptjs');

    return await bcrypt.compare(password, hashedPassword);
  }
}

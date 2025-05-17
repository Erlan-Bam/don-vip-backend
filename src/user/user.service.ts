import { HttpException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
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

  async updateToUser(id: number, identifier: string, password: string) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        identifier: identifier,
        password: hashedPassword,
      },
    });
  }

  async findById(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        coupon: true,
      },
    });
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

  async updateProfile(data: Partial<UpdateProfileDto>) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.id },
    });

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
        gender: data.gender,
        phone: data.phone,
      },
    });
  }
  async findByIdentifier(identifier: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { identifier: identifier },
    });
  }

  async findAllUsers(query: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search = '', page = 1, limit = 10 } = query;

    const searchFilter: Prisma.UserWhereInput = search
      ? {
          OR: [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } },
            { identifier: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const where: Prisma.UserWhereInput = {
      ...searchFilter,
      NOT: {
        identifier: null,
      },
    };

    const users = await this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' },
    });

    const total = await this.prisma.user.count({ where });

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async banUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    if (user.role === 'Admin') {
      throw new HttpException('Admin cannot be banned', 400);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { is_banned: true },
    });
  }

  async unbanUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { is_banned: false },
    });
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const bcrypt = await import('bcryptjs');

    return await bcrypt.compare(password, hashedPassword);
  }
}

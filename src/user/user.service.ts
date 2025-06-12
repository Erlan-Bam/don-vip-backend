import { HttpException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { last } from 'rxjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: RegisterDto, code: string) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await this.prisma.user.create({
      data: {
        identifier: data.identifier,
        password: hashedPassword,
        verification_code: code,
      },
    });
  }

  async updateToUser(
    id: number,
    identifier: string,
    password: string,
    code: string,
  ) {
    const exist = await this.findByIdentifier(identifier);
    if (exist) {
      throw new HttpException('User with this email already exists', 409);
    }
    const user = await this.findById(id);
    if (user.identifier) {
      throw new HttpException('User with this email already exists', 409);
    }
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        identifier: identifier,
        password: hashedPassword,
        verification_code: code,
      },
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return user;
  }

  async resetPassword(data: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { identifier: data.identifier },
      select: { password: true },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const bcrypt = await import('bcryptjs');
    const isMatch =
      (await bcrypt.compare(data.new_password, user.password)) &&
      user.password !== '';
    console.log();
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

  async getUserPayments(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          order: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where: { user_id: userId } }),
    ]);

    const formatted = payments.map((payment) => {
      return {
        id: payment.id,
        method: payment.method,
        status: payment.status,
        price: Number(payment.price),
        createdAt: payment.created_at,
        orderId: payment.order_id,
        product: payment.order?.product?.name ?? '—',
      };
    });

    return {
      total,
      page,
      limit,
      data: formatted,
    };
  }

  async setVerified(identifier: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { identifier },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (user.is_verified) {
      throw new HttpException('User is already verified', 409);
    }

    if (user.verification_code !== code) {
      throw new HttpException('Invalid verification code', 400);
    }

    return this.prisma.user.update({
      where: { identifier },
      data: {
        is_verified: true,
        verification_code: null, // очищаем после успешной верификации
      },
    });
  }

  async updateProfile(data: Partial<UpdateProfileDto>) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.id },
    });

    if (data.email) {
      const exist = await this.prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          email: true,
        },
      });
      if (exist && exist.id !== data.id) {
        throw new HttpException('User with this email already exists', 400);
      }
    }
    if (data.phone) {
      const exist = await this.prisma.user.findUnique({
        where: { phone: data.phone },
        select: {
          id: true,
          phone: true,
        },
      });
      if (exist && exist.id !== data.id) {
        throw new HttpException('User with this phone already exists', 400);
      }
    }

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    // ✅ Преобразуем birth_date в ISO 8601, если формат DD.MM.YYYY
    let formattedBirthDate: string | undefined = undefined;

    if (data.birth_date) {
      if (data.birth_date.includes('.')) {
        // формат DD.MM.YYYY
        const [day, month, year] = data.birth_date.split('.');
        formattedBirthDate = `${year}-${month}-${day}`;
      } else {
        // предполагаем, что уже ISO
        formattedBirthDate = data.birth_date;
      }
    }

    const isNewAvatar = data.avatar && data.avatar !== user.avatar;

    if (isNewAvatar && user.avatar) {
      try {
        const filename = user.avatar.split('/').pop();
        const filePath = join(process.cwd(), 'uploads', 'avatars', filename);
        await unlink(filePath);
      } catch (err) {
        console.warn('Failed to delete old avatar:', err.message);
      }
    }

    return await this.prisma.user.update({
      where: { id: data.id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        avatar: data.avatar,
        gender: data.gender,
        phone: data.phone,
        birth_date: formattedBirthDate,
        email: data.email,
      },
    });
  }

  async getUsersCount(): Promise<number> {
    return await this.prisma.user.count({
      where: {
        identifier: {
          not: null,
        },
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
      NOT: { identifier: null },
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          orders: {
            where: {
              status: 'Paid',
            },
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const enriched = users.map((user) => {
      const totalSpent = user.orders.reduce((sum, order) => {
        let replenishment = { amount: 0, price: 0 };
        try {
          const parsed = Array.isArray(order.product.replenishment)
            ? order.product.replenishment
            : JSON.parse(order.product.replenishment as any);
          replenishment = parsed[order.item_id];
        } catch (err) {}
        return sum + replenishment.price;
      }, 0);
      const orderCount = user.orders.length;
      const avgCheck = orderCount > 0 ? totalSpent / orderCount : 0;

      return {
        id: user.id,
        avatar: user.avatar,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        identifier: user.identifier,
        phone: user.phone,
        isBanned: user.is_banned,
        orderCount,
        totalSpent: Math.round(totalSpent),
        avgCheck: Math.round(avgCheck),
      };
    });

    return {
      data: enriched,
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

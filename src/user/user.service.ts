import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async createUser(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await this.prisma.user.create({
      data: {
        identifier: data.identifier,
        password: hashedPassword,
      },
    });
  }
  async resetPassword(data: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { identifier: data.identifier },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
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
  async findByIdentifier(identifier: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { identifier: identifier },
    });
  }
  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }
}

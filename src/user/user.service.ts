import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';

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

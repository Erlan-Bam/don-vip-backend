import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Injectable()
export class BankService {
  constructor(private readonly prisma: PrismaService) {}

  async createBank(dto: CreateBankDto) {
    return this.prisma.bank.create({
      data: {
        name: dto.name,
        isActive: dto.isActive,
      },
    });
  }

  async updateBank(id: number, dto: UpdateBankDto) {
    const existing = await this.prisma.bank.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return this.prisma.bank.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async getBankById(id: number) {
    const bank = await this.prisma.bank.findUnique({ where: { id } });
    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }
    return bank;
  }

  async getBanks(
    page: number,
    limit: number,
    isActive?: boolean,
  ): Promise<{
    data: Array<{
      id: number;
      name: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const take = limit;
    const whereClause = isActive !== undefined ? { isActive } : {};

    const [data, total] = await Promise.all([
      this.prisma.bank.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.bank.count({ where: whereClause }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async deleteBank(id: number) {
    const existing = await this.prisma.bank.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return this.prisma.bank.delete({ where: { id } });
  }
}

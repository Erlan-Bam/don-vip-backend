import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateProductDto) {
    return await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        replenishment: JSON.parse(JSON.stringify(data.replenishment)),
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data: products,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<CreateProductDto>) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        replenishment: data.replenishment
          ? JSON.parse(JSON.stringify(data.replenishment))
          : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}

import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateProductDto, ReplenishmentItem } from './dto/create-product.dto';
import { SmileService } from 'src/shared/services/smile.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private smileService: SmileService,
  ) {}
  async create(data: CreateProductDto) {
    if (data.smile_api_game) {
      const { status, data: smileProducts } =
        await this.smileService.getProducts();
      if (status !== 'error') {
        const hasMatchingGame = smileProducts.some(
          (product) => product.apiGame === data.smile_api_game,
        );

        if (!hasMatchingGame) {
          throw new HttpException('Invalid api game', 400);
        }
      }
    }
    return await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        replenishment: JSON.parse(JSON.stringify(data.replenishment)),
        type: data.type,
        smile_api_game: data.smile_api_game,
      },
    });
  }

  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.product.count({ where }),
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

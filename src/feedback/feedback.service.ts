import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFeedbackDto) {
    return await this.prisma.feedback.create({
      data: {
        text: data.text,
        reaction: data.reaction,
        product: {
          connect: { id: data.product_id },
        },
        user: {
          connect: { id: data.user_id },
        },
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          product: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
      this.prisma.feedback.count(),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    return feedback;
  }

  async update(id: number, data: UpdateFeedbackDto) {
    return await this.prisma.feedback.update({
      where: { id: id, user_id: data.user_id },
      data: data,
    });
  }

  async remove(id: number) {
    return await this.prisma.feedback.delete({ where: { id } });
  }
}

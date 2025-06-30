import { Injectable } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        image: createBannerDto.image,
        mobileImage: createBannerDto.mobileImage,
        buttonLink: createBannerDto.buttonLink,
        title: createBannerDto.title, // Add title explicitly
      },
    });
  }

  findAll() {
    return this.prisma.banner.findMany();
  }

  findOne(id: number) {
    return this.prisma.banner.findUnique({
      where: { id },
    });
  }

  update(id: number, updateBannerDto: UpdateBannerDto) {
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...updateBannerDto,
        title: updateBannerDto.title, // Add title explicitly for update
      },
    });
  }

  remove(id: number) {
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}

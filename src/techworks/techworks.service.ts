import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { UpdateTechWorksDto } from './dto/update-techwork.dto';

@Injectable()
export class TechworksService {
  constructor(private readonly prisma: PrismaService) {}

  // Получить запись Website по id (либо первый сайт, если у тебя только один)
  async getById(id: number) {
    const site = await this.prisma.website.findUnique({
      where: { id },
    });
    if (!site) {
      throw new NotFoundException(`Website с id=${id} не найден`);
    }
    return site;
  }

  // Обновить флаг isTechWorks
  async updateTechWorks(id: number, dto: UpdateTechWorksDto) {
    // Сначала проверим, что сайт есть
    await this.getById(id);

    // Делаем update
    const updated = await this.prisma.website.update({
      where: { id },
      data: {
        isTechWorks: dto.isTechWorks,
      },
    });
    return updated;
  }

  // (Опционально) метод, чтобы переключать флаг навстречу целому chain-эффекту
  async toggleTechWorks(id: number) {
    const site = await this.getById(id);
    const updated = await this.prisma.website.update({
      where: { id },
      data: {
        isTechWorks: !site.isTechWorks,
      },
    });
    return updated;
  }
}

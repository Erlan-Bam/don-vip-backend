// src/techworks/techworks.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { UpdateTechWorksDto } from './dto/update-techwork.dto';

@Injectable()
export class TechworksService {
  private readonly logger = new Logger(TechworksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Получить запись Website
  async getById(id: number) {
    const site = await this.prisma.website.findUnique({
      where: { id },
    });
    if (!site) {
      throw new NotFoundException(`Website с id=${id} не найден`);
    }
    return site;
  }

  // Обновить флаг isTechWorks и запустить таймер, если нужно
  async updateTechWorks(id: number, dto: UpdateTechWorksDto) {
    // Проверяем, существует ли сайт
    const site = await this.getById(id);

    // Вычисляем точку выключения, если пришла duration
    let techWorksEndsAt: Date | null = null;
    if (dto.durationMinutes && dto.isTechWorks) {
      const now = new Date();
      techWorksEndsAt = new Date(
        now.getTime() + dto.durationMinutes * 60 * 1000,
      );
    }

    // Делаем обновление в БД
    const updated = await this.prisma.website.update({
      where: { id },
      data: {
        isTechWorks: dto.isTechWorks,
        techWorksEndsAt: techWorksEndsAt,
      },
    });

    // Если включаем тех. работы и задали duration – ставим setTimeout
    if (dto.durationMinutes && dto.isTechWorks) {
      const ms = dto.durationMinutes * 60 * 1000;
      this.logger.log(
        `Scheduling auto-disable of tech works for Website ${id} in ${dto.durationMinutes} minutes`,
      );
      setTimeout(async () => {
        try {
          // Повторно проверяем в БД: если всё ещё в тех. работах и время вышло — выключаем
          const current = await this.prisma.website.findUnique({
            where: { id },
          });
          if (current && current.isTechWorks) {
            // Дополнительно можем свериться current.techWorksEndsAt <= now, но примерно так:
            const nowCheck = new Date();
            if (
              current.techWorksEndsAt &&
              current.techWorksEndsAt <= nowCheck
            ) {
              await this.prisma.website.update({
                where: { id },
                data: { isTechWorks: false },
              });
              this.logger.log(`Auto-disabled tech works for Website ${id}`);
            }
          }
        } catch (error) {
          this.logger.error(
            `Ошибка при авто-выключении tech works для Website ${id}: ${error.message}`,
          );
        }
      }, ms);
    }

    // Если же isTechWorks=false, обнуляем techWorksEndsAt
    if (!dto.isTechWorks) {
      // При query выше уже записали techWorksEndsAt = null
      this.logger.log(`Tech works manually disabled for Website ${id}`);
    }

    return updated;
  }

  // Переключить флаг вручную (toggle), таймер не трогаем
  async toggleTechWorks(id: number) {
    const site = await this.getById(id);
    const updated = await this.prisma.website.update({
      where: { id },
      data: {
        isTechWorks: !site.isTechWorks,
        techWorksEndsAt: null, // сбрасываем таймер при ручном переключении
      },
    });
    return updated;
  }
}

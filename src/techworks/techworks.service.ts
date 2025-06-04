// src/techworks/techworks.service.ts
import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/shared/services/prisma.service';
import { UpdateTechWorksDto } from './dto/update-techwork.dto';

@Injectable()
export class TechworksService {
  private readonly logger = new Logger(TechworksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1) Получаем сайт по id
  async getById(id: number) {
    const site = await this.prisma.website.findUnique({
      where: { id },
    });
    if (!site) {
      throw new NotFoundException(`Website с id=${id} не найден`);
    }
    return site;
  }

  // 2) Обновляем флаг isTechWorks и записываем techWorksEndsAt из DTO
  async updateTechWorks(id: number, dto: UpdateTechWorksDto) {
    // Убеждаемся, что сайт существует
    const site = await this.getById(id);

    // Если клиент хочет включить техработы
    let parsedEndsAt: Date | null = null;
    if (dto.isTechWorks) {
      if (!dto.techWorksEndsAt) {
        throw new BadRequestException(
          'Когда isTechWorks=true, нужно передавать valid ISO-дату в поле techWorksEndsAt',
        );
      }
      // Парсим ISO-строку
      parsedEndsAt = new Date(dto.techWorksEndsAt);
      if (isNaN(parsedEndsAt.getTime())) {
        throw new BadRequestException(
          `Невалидная дата в techWorksEndsAt: ${dto.techWorksEndsAt}`,
        );
      }
      // Дополнительно можно проверить: дата в будущем
      const now = new Date();
      if (parsedEndsAt <= now) {
        throw new BadRequestException(
          'techWorksEndsAt должна быть датой в будущем',
        );
      }
    }

    // Если клиент выключает техработы, сразу сбросим дату
    if (!dto.isTechWorks) {
      parsedEndsAt = null;
    }

    // Обновляем запись в БД
    const updated = await this.prisma.website.update({
      where: { id },
      data: {
        isTechWorks: dto.isTechWorks,
        techWorksEndsAt: parsedEndsAt,
      },
    });

    // Логging
    if (!dto.isTechWorks) {
      this.logger.log(`Tech works manually disabled for Website ${id}`);
    } else {
      this.logger.log(
        `Tech works enabled for Website ${id} until ${parsedEndsAt.toISOString()}`,
      );
    }

    return updated;
  }
  @Cron(CronExpression.EVERY_MINUTE)
  private async handleExpiredTechWorks() {
    const now = new Date();
    // Ищем сайты с истёкшим техработным периодом
    const sitesToDisable = await this.prisma.website.findMany({
      where: {
        isTechWorks: true,
        techWorksEndsAt: { lte: now },
      },
    });

    if (sitesToDisable.length > 0) {
      this.logger.log(
        `Найдены ${sitesToDisable.length} сайтов для авто-выключения техработ (до сейчас ${now.toISOString()})`,
      );
    }

    for (const site of sitesToDisable) {
      try {
        await this.prisma.website.update({
          where: { id: site.id },
          data: {
            isTechWorks: false,
            techWorksEndsAt: null,
          },
        });
        this.logger.log(`Auto-disabled tech works for Website ${site.id}`);
      } catch (error) {
        this.logger.error(
          `Ошибка при авто-выключении tech works для Website ${site.id}: ${error.message}`,
        );
      }
    }
  }

  // 4) Ручное переключение флага без учёта переданной даты
  async toggleTechWorks(id: number) {
    const site = await this.getById(id);
    const updated = await this.prisma.website.update({
      where: { id },
      data: {
        isTechWorks: !site.isTechWorks,
        techWorksEndsAt: null, // сбрасываем дату, когда переключаем вручную
      },
    });
    this.logger.log(
      `Tech works toggled manually for Website ${id}, new isTechWorks=${updated.isTechWorks}`,
    );
    return updated;
  }
}

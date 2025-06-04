import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/shared/guards/admin.guards';

@ApiTags('banks')
@Controller('banks')
@UseGuards(AuthGuard('jwt')) // Все маршруты требуют аутентификации
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminGuard) // Только администратор может создать новый банк
  @ApiOperation({ summary: 'Создать новый банк' })
  @ApiResponse({
    status: 201,
    description: 'Банк успешно создан.',
    schema: {
      example: {
        id: 1,
        name: 'Central Bank',
        isActive: true,
        createdAt: '2025-06-04T08:23:45.123Z',
        updatedAt: '2025-06-04T08:23:45.123Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Неверные данные в теле запроса' })
  async createBank(@Body() dto: CreateBankDto) {
    return this.bankService.createBank(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard) // Только администратор может обновить
  @ApiOperation({ summary: 'Обновить банк по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID банка для обновления',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Банк успешно обновлен.',
    schema: {
      example: {
        id: 42,
        name: 'Updated Bank Name',
        isActive: false,
        createdAt: '2025-05-20T12:00:00.000Z',
        updatedAt: '2025-06-04T09:15:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Банк с таким ID не найден' })
  async updateBank(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBankDto,
  ) {
    return this.bankService.updateBank(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить банк по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID банка для получения',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о банке.',
    schema: {
      example: {
        id: 42,
        name: 'Central Bank',
        isActive: true,
        createdAt: '2025-05-10T11:30:00.000Z',
        updatedAt: '2025-05-20T14:45:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Банк с таким ID не найден' })
  async getBankById(@Param('id', ParseIntPipe) id: number) {
    return this.bankService.getBankById(id);
  }

  @Get()
  @ApiOperation({
    summary:
      'Получить список банков с пагинацией и (опциональным) фильтром по isActive',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы (по умолчанию = 1)',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество записей на страницу (по умолчанию = 10)',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Фильтровать по активности: true или false',
    example: true,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description:
      'Возвращает объект с массивом банков, общим количеством, текущей страницей и лимитом',
    schema: {
      example: {
        data: [
          {
            id: 1,
            name: 'Central Bank',
            isActive: true,
            createdAt: '2025-06-01T10:00:00.000Z',
            updatedAt: '2025-06-03T12:00:00.000Z',
          },
          {
            id: 2,
            name: 'People’s Bank',
            isActive: false,
            createdAt: '2025-05-15T09:00:00.000Z',
            updatedAt: '2025-05-20T11:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      },
    },
  })
  async getBanks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('isActive') isActive?: string,
  ) {
    // Преобразуем query string в boolean (или undefined, если не передано)
    const isActiveBool =
      isActive !== undefined ? isActive === 'true' : undefined;

    return this.bankService.getBanks(page, limit, isActiveBool);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard) // Только администратор может удалить
  @ApiOperation({ summary: 'Удалить банк по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID банка для удаления',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Банк успешно удален.',
    schema: {
      example: {
        id: 42,
        name: 'Old Bank',
        isActive: false,
        createdAt: '2025-04-01T08:00:00.000Z',
        updatedAt: '2025-05-01T09:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Банк с таким ID не найден' })
  async deleteBank(@Param('id', ParseIntPipe) id: number) {
    return this.bankService.deleteBank(id);
  }
}

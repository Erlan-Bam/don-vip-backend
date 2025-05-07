import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackService } from './feedback.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Feedback')
@Controller('feedback')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Create feedback' })
  @ApiBody({ description: 'Create feedback data', type: CreateFeedbackDto })
  async create(@Body() data: CreateFeedbackDto) {
    return this.feedbackService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedbacks' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.feedbackService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feedback' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateFeedbackDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.remove(id);
  }
}

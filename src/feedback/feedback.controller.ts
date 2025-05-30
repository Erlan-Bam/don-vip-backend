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
  Request,
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
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create feedback' })
  @ApiBody({ description: 'Create feedback data', type: CreateFeedbackDto })
  async create(@Body() data: CreateFeedbackDto, @Request() request) {
    data.user_id = request.user.id;
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
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update feedback' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateFeedbackDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateFeedbackDto,
    @Request() request,
  ) {
    data.user_id = request.user_id;
    return this.feedbackService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.remove(id);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept feedback' })
  @ApiParam({ name: 'id', type: Number })
  async accept(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.accept(id);
  }

  @Patch(':id/decline')
  @ApiOperation({ summary: 'Decline feedback' })
  @ApiParam({ name: 'id', type: Number })
  async decline(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.decline(id);
  }

  @Get('/list/accepted')
  @ApiOperation({ summary: 'Get accepted feedbacks only' })
  @ApiQuery({ name: 'page', required: false, type: String, example: '1' })
  @ApiQuery({ name: 'limit', required: false, type: String, example: '10' })
  async findAccepted(@Query('page') page: any, @Query('limit') limit: any) {
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;

    return this.feedbackService.findAccepted(safePage, safeLimit);
  }

  @Get('/list/incoming')
  @ApiOperation({ summary: 'Get accepted feedbacks only' })
  @ApiQuery({ name: 'page', required: false, type: String, example: '1' })
  @ApiQuery({ name: 'limit', required: false, type: String, example: '10' })
  async findIncoming(@Query('page') page: any, @Query('limit') limit: any) {
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;

    return this.feedbackService.findIncoming(safePage, safeLimit);
  }
}

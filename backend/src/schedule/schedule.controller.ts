import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { FindScheduleDto } from './dto/find-schedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  find(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const userId = req.user._doc._id;
    return this.scheduleService.findSchedule(userId, startDate, endDate);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteSchedule(@Param('id') id: string) {
    return await this.scheduleService.deleteSchedule(id);
  }

  @Post('sample')
  @UseGuards(JwtAuthGuard)
  createSampleData(@Req() req) {
    const userId = req.user._doc._id;
    return this.scheduleService.createSampleData(userId);
  }

  // @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // findOne(@Param('id') id: string) {
  //   return this.scheduleService.findOne(id);
  // }

  // @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  // update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
  //   return this.scheduleService.update(id, updateScheduleDto);
  // }

  // @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  // remove(@Param('id') id: string) {
  //   return this.scheduleService.remove(id);
  // }
}

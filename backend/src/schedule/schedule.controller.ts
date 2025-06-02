import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, NotFoundException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { FindScheduleDto } from './dto/find-schedule.dto';
import { ApiResponseDto } from 'src/common/dto/api.response.dto';
import mongoose from 'mongoose';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }

  @Post('sample')
  @UseGuards(JwtAuthGuard)
  createSampleData(@Req() req) {
    const userId = req.user._doc._id;
    return this.scheduleService.createSampleData(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSchedule(@Param('id') id: string, @Req() req) {
    return this.scheduleService.deleteSchedule(id, req.user._doc._id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':scheduleId/days/:dayIndex/events/:eventIndex')
  async deleteEvent(
    @Param('scheduleId') scheduleId: string,
    @Param('dayIndex') dayIndex: number,
    @Param('eventIndex') eventIndex: number,
    @Req() req
  ) {
    const userId = req.user._id;
    return this.scheduleService.deleteEvent(scheduleId, dayIndex, eventIndex, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':scheduleId/days/:dayIndex/budget')
  async updateDayBudget(
    @Param('scheduleId') scheduleId: string,
    @Param('dayIndex') dayIndex: number,
    @Body('totalBudget') totalBudget: number,
    @Req() req
  ) {
    const userId = req.user._id;
    return this.scheduleService.updateDayBudget(scheduleId, dayIndex, totalBudget, userId);
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

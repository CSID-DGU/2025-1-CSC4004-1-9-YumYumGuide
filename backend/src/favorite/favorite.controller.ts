import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, InternalServerErrorException, Put, NotFoundException } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { UserDocument } from 'src/user/schemas/user.schema';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createFavoriteDto: CreateFavoriteDto) {
    const user = req.user as UserDocument;
    console.log('Request user object in FavoriteController:', user);
    if (!user || !user.id) {
      console.error('User ID is missing in the request object.');
      throw new InternalServerErrorException('User ID is missing from token or request');
    }
    return this.favoriteService.create(user.id, createFavoriteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserFavorite(@Req() req: any) {
    const user = req.user as UserDocument;
    if (!user || !user.id) {
      console.error('User ID is missing in the request object (GET).');
      throw new InternalServerErrorException('User ID is missing from token or request');
    }
    const favorite = await this.favoriteService.findByUserId(user.id);
    if (!favorite) {
      return {};
    }
    return favorite;
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateUserFavorite(@Req() req: any, @Body() updateFavoriteDto: UpdateFavoriteDto) {
    const user = req.user as UserDocument;
    if (!user || !user.id) {
      console.error('User ID is missing in the request object (PUT).');
      throw new InternalServerErrorException('User ID is missing from token or request');
    }
    return this.favoriteService.updateByUserId(user.id, updateFavoriteDto);
  }

  @Get('all')
  findAll() {
    return this.favoriteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoriteService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoriteService.remove(id);
  }

  @Delete('user/current')
  @UseGuards(JwtAuthGuard)
  async removeCurrentUserFavorite(@Req() req: any) {
    const user = req.user as UserDocument;
    if (!user || !user.id) {
      throw new InternalServerErrorException('User ID is missing');
    }
    return this.favoriteService.removeByUserId(user.id);
  }
}

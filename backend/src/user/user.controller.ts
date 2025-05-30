import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { UserDocument } from './schemas/user.schema';
// import { CreateUserDto } from './dto/create-user-request.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Patch('nickname')
  @UseGuards(JwtAuthGuard)
  async updateNickname(@Req() req: any, @Body() updateNicknameDto: UpdateNicknameDto) {
    const user = req.user as UserDocument;
    return this.userService.updateNickname(user.id, updateNicknameDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(@Req() req: any): Promise<UserDocument | null> {
    console.log('[UserController /me] req.user:', req.user);
    if (!req.user || !req.user.id) {
      console.error('[UserController /me] User or User ID not found in req.user');
      throw new InternalServerErrorException('User ID not found in token');
    }
    return this.userService.findOne(req.user.id);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(`[UserController /:id] Finding user with id: ${id}`);
    return this.userService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id', ParseIntPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

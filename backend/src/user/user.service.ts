import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { FavoriteService } from 'src/favorite/favorite.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly favoriteService: FavoriteService,
  ) {
  }

  async create(createUserDto: CreateUserRequestDto) {
    const user = await this.userModel.create(createUserDto);
    return user;
  }

  async updateNickname(userId: string, updateNicknameDto: UpdateNicknameDto): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, { username: updateNicknameDto.nickname }, { new: true }).exec();
  }

  async checkIfUserHasPreferences(userId: string): Promise<boolean> {
    const favorite = await this.favoriteService.findByUserId(userId);
    return !!favorite;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}

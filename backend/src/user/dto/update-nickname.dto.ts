import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class UpdateNicknameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;
} 
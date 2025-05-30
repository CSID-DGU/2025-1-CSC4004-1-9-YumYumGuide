import { Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { ApiResponseDto } from 'src/common/dto/api.response.dto';
import { UserResponseDto } from 'src/user/dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Authorization } from './custom-guards-decorators/get-user.decorators';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { FavoriteService } from 'src/favorite/favorite.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private userService: UserService,
    private favoriteService: FavoriteService,
  ) { }

  // 인증된 회원이 들어갈 수 있는 테스트 URL 경로

  @Get('/test')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async testForAuth(@Authorization() user: User): Promise<ApiResponseDto<UserResponseDto>> {
    this.logger.verbose(`Authenticated user accessing test route: ${user.email}`);
    const userResponseDto = new UserResponseDto(user);
    return new ApiResponseDto(true, 200, 'You are authenticated', userResponseDto);
  }

  @Get('/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Authorization() user: UserDocument, @Req() req: any): Promise<ApiResponseDto<any>> {
    try {
      this.logger.verbose(`Getting current user information for user: ${JSON.stringify(user)}`);
      
      if (!user) {
        throw new Error('User not found');
      }

      // 사용자 정보에 _id를 userId로 추가
      const userData = {
        ...user.toObject(),
        userId: user._id?.toString() || '' // MongoDB의 _id를 userId로 사용
      };

      // password와 __v 필드 제거
      delete userData.password;
      delete userData.__v;

      // 사용자의 선호도 정보 가져오기
      const preferences = await this.favoriteService.findByUserId(userData.userId);
      this.logger.verbose(`User preferences: ${JSON.stringify(preferences)}`);

      // 사용자 정보와 선호도 정보를 함께 반환
      const responseData = {
        ...userData,
        preferences: preferences || null
      };

      console.log(responseData, 'userData with preferences');
      return new ApiResponseDto(true, 200, 'Current user information retrieved successfully', responseData);
    } catch (error) {
      this.logger.error(`Error in getCurrentUser: ${error.message}`);
      throw error;
    }
  }

  // 카카오 로그인 페이지 요청
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(@Req() req: Request) {
    // 이 부분은 Passport의 AuthGuard에 의해 카카오 로그인 페이지로 리다이렉트
  }

  // 카카오 로그인 콜백 엔드포인트
  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new InternalServerErrorException('User information not found');
      }

      const user = req.user as UserDocument;
      
      // 이전 토큰이 있다면 삭제
      await this.authService.invalidateExistingTokens(user.id);
      
      // 새로운 JWT 토큰 생성
      const jwtToken = await this.authService.generateJwtToken(user);
      const userResponseDto = new UserResponseDto(user);
    
      this.logger.verbose(`User signed in successfully: ${JSON.stringify(userResponseDto)}`);
    
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      
      // 사용자 취향 정보 확인
      const hasPreferences = await this.userService.checkIfUserHasPreferences(user.id);

      res.cookie('auth_token', jwtToken, {
        httpOnly: false, 
        secure: false,   
        sameSite: 'lax', 
        maxAge: 24 * 60 * 60 * 1000 
      });

      if (hasPreferences) {
        res.redirect(`${frontendUrl}/home`);
      } else {
        res.redirect(`${frontendUrl}/signin`);
      }
    } catch (error) {
      this.logger.error(`Kakao callback error: ${error.message}`, error.stack);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }
}
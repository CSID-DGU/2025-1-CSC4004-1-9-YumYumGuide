import { Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/schemas/user.schema';
import { ApiResponseDto } from 'src/common/dto/api.response.dto';
import { UserResponseDto } from 'src/user/dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Authorization } from './custom-guards-decorators/get-user.decorators';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성

  constructor(
    private authService: AuthService,
    private configService: ConfigService
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

      const user = req.user;
      
      // 이전 토큰이 있다면 삭제
      await this.authService.invalidateExistingTokens(user.id);
      
      // 새로운 JWT 토큰 생성
      const jwtToken = await this.authService.generateJwtToken(user);
      const userResponseDto = new UserResponseDto(user);
    
      this.logger.verbose(`User signed in successfully: ${JSON.stringify(userResponseDto)}`);
    
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      // 토큰을 쿠키에 저장하고 홈 화면으로 리다이렉트
      res.cookie('auth_token', jwtToken, {
        httpOnly: false, // 개발환경에서만 false
        secure: false,   // 개발환경에서만 false
        sameSite: 'lax', // 또는 'strict'
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: 'none',
        // domain: 'localhost',
        maxAge: 24 * 60 * 60 * 1000 // 24시간
      });
      res.redirect(`${frontendUrl}/home`);
    } catch (error) {
      this.logger.error(`Kakao callback error: ${error.message}`, error.stack);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }
}
import { Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/schemas/user.schema';
import { ApiResponseDto } from 'src/common/dto/api.response.dto';
import { UserResponseDto } from 'src/user/dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Authorization } from './custom-guards-decorators/get-user.decorators';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성

  constructor(private authService: AuthService) { }

  // 인증된 회원이 들어갈 수 있는 테스트 URL 경로

  @Post('/test')
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
    const user = req.user; // Passport에서 자동으로 설정된 사용자 정보
    
    // JWT 토큰 생성
    const jwtToken = await this.authService.generateJwtToken(user);
    const userResponseDto = new UserResponseDto(user);
  
    this.logger.verbose(`User signed in successfully: ${JSON.stringify(userResponseDto)}`);
  
    // 프론트엔드로 리다이렉트 (토큰과 함께)
    res.redirect(`http://localhost:3001/auth/success?token=${jwtToken}`);

  }
}
import { Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/schemas/user.schema';
import { ApiResponseDto } from 'src/common/api.response.dto/api.response.dto';
import { GetUser } from './custom-guards-decorators/get-user.decorators';
import { UserResponseDto } from 'src/user/dto/update-user.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성

  constructor(private authService: AuthService) { }

  // 회원 가입 기능
  @Post('/signup')
  async signUp(@Body() signUpRequestDto: SignUpRequestDto): Promise<ApiResponseDto<UserResponseDto>> { // 응답 통일에 Dto넣기
    // 로그 찍기
    this.logger.verbose(`Attempting to sign up user with email: ${signUpRequestDto.email}`);

    // authService에서 회원가입 처리
    const user = await this.authService.signUp(signUpRequestDto);

    // 응답 Dto 생성
    const userResponseDto = new UserResponseDto(user);

    this.logger.verbose(`User signed up successfully: ${JSON.stringify(userResponseDto)}`);

    return new ApiResponseDto(true, 201, 'User signed up successfully', userResponseDto);
  }

  // 로그인 기능
  @Post('/signin')
  async signIn(@Body() signInRequestDto: SignInRequestDto, @Res() res: Response): Promise<void> {
    this.logger.verbose(`Attempting to sign in user with email: ${signInRequestDto.email}`);
    const { jwtToken, user } = await this.authService.signIn(signInRequestDto);
    const userResponseDto = new UserResponseDto(user);
    this.logger.verbose(`User signed in successfully: ${JSON.stringify(userResponseDto)}`);

    // [3] 쿠키 설정
    res.cookie('Authorization', jwtToken, {
      httpOnly: true, // 클라이언트 측 스크립트에서 쿠키 접근 금지
      secure: false, // HTTPS에서만 쿠키 전송, 임시 비활성화
      maxAge: 3600000, // 1시간
      sameSite: 'none', // CSRF 공격 방어
    });

    res.status(200).json(new ApiResponseDto(true, 200, 'Sign in successful', { jwtToken, user: userResponseDto }));
  }

  // 인증된 회원이 들어갈 수 있는 테스트 URL 경로
  @Post('/test')
  @UseGuards(AuthGuard()) // @UseGuards : 핸들러는 지정한 인증 가드가 적용됨 -> AuthGuard()의 'jwt'는 기본값으로 생략가능
  async testForAuth(@GetUser() user: User): Promise<ApiResponseDto<UserResponseDto>> {
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
  async kakaoCallback(@Query('code') kakaoAuthResCode: string, @Res() res: Response) {
    console.log('kakaoAuthResCode', kakaoAuthResCode);
    const { jwtToken, user } = await this.authService.signInWithKakao(kakaoAuthResCode);

    // 쿠키에 JWT 설정
    res.cookie('Authorization', jwtToken, {
      httpOnly: true, // 클라이언트 측 스크립트에서 쿠키 접근 금지
      secure: false, // HTTPS에서만 쿠키 전송, 임시 비활성화
      maxAge: 3600000, // 1시간
      // sameSite: 'none', // CSRF 공격 방어
    });
    const userResponseDto = new UserResponseDto(user);

    this.logger.verbose(`User signed in successfully: ${JSON.stringify(userResponseDto)}`);
    res.status(200).json(new ApiResponseDto(true, 200, 'Sign in successful', { jwtToken, user: userResponseDto }));
  }
}
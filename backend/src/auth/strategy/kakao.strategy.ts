import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService

  ) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // 카카오에서 받은 프로필 정보로 사용자 생성 및 조회
    const user = await this.authService.signUpWithKakao(profile.id, profile);
    return user;
  }
}
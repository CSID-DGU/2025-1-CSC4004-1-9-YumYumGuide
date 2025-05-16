import { ConflictException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService
  ) { }

  // 비밀번호 해싱 암호화 메서드
  private async hashPassword(password: string): Promise<string> {
    this.logger.verbose(`Hashing password`);

    const salt = await bcrypt.genSalt(); // 솔트 생성
    return await bcrypt.hash(password, salt); // 비밀번호 해싱
  }

  // 카카오 정보 회원 가입
  async signUpWithKakao(kakaoId: string, profile: any): Promise<UserDocument> {

    // 이름이랑 이메일을 알아야겠네 여기까지
    const kakaoUsername = profile.properties.nickname;
    const kakaoEmail = profile.kakao_account.email;

    // 카카오 프로필 데이터를 기반으로 사용자 찾기 또는 생성 로직을 구현
    const existingUser = await this.userModel.findOne({ email: kakaoEmail });
    if (existingUser) {
      return existingUser;
    }

    // 비밀번호 필드에 랜덤 문자열 생성
    const temporaryPassword = uuidv4(); // 랜덤 문자열 생성
    const hashedPassword = await this.hashPassword(temporaryPassword);

    // 새 사용자 생성 로직
    const newUser = this.userModel.create({
      username: kakaoUsername,
      email: kakaoEmail,
      password: hashedPassword, // 해싱된 임시 비밀번호 사용
    });
    return newUser;
  }

  // 카카오 로그인
  async signInWithKakao(kakaoAuthResCode: string): Promise<{ jwtToken: string, user: UserDocument }> {
    // Authorization Code로 Kakao API에 Access Token 요청
    const accessToken = await this.getKakaoAccessToken(kakaoAuthResCode);

    // Access Token으로 Kakao 사용자 정보 요청
    const kakaoUserInfo = await this.getKakaoUserInfo(accessToken);

    // 카카오 사용자 정보를 기반으로 회원가입 또는 로그인 처리
    const user = await this.signUpWithKakao(kakaoUserInfo.id.toString(), kakaoUserInfo);

    // [1] JWT 토큰 생성 (Secret + Payload)
    const jwtToken = await this.generateJwtToken(user);

    // [2] 사용자 정보 반환
    return { jwtToken, user };
  }

  // Kakao Authorization Code로 Access Token 요청
  async getKakaoAccessToken(code: string): Promise<string> {
    const tokenUrl = 'https://kauth.kakao.com/oauth/token';
    const payload = {
      grant_type: 'authorization_code',
      client_id: this.configService.get<string>('KAKAO_CLIENT_ID'), // Kakao REST API Key
      redirect_uri: this.configService.get<string>('KAKAO_CALLBACK_URL'),
      code,
    };

    // http는 다른 서버와 통신할 때 사용하는 도구
    const response = await firstValueFrom(this.httpService.post(tokenUrl, null, {
      params: payload,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }));

    return response.data.access_token;  // Access Token 반환
  }

  // Access Token으로 Kakao 사용자 정보 요청
  async getKakaoUserInfo(accessToken: string): Promise<any> {
    const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';

    // 헤더에 Authorization 키를 포함하여 요청
    // KaKao 연결된 사용자가 있는지 확인
    const response = await firstValueFrom(this.httpService.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }));
    this.logger.debug(`Kakao User Info: ${JSON.stringify(response.data)}`); // 데이터 확인
    return response.data;
  }

  // JWT 생성 공통 메서드
  async generateJwtToken(user: UserDocument): Promise<string> {
    // [1] JWT 토큰 생성 (Secret + Payload)
    const payload = {
      email: user.email,
      userId: user.id,
    };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(`Generated JWT Token: ${accessToken}`);
    this.logger.debug(`User details: ${JSON.stringify(user)}`);
    return accessToken;
  }
}
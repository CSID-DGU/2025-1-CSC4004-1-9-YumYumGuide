import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export class JwtAuthGuard extends AuthGuard('jwt') { }
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // header에서 bearer토큰 추출
      ignoreExpiration: false, // 만료된 토큰 무시
      secretOrKey: configService.get<string>('JWT_SECRET')!, // 토큰 검증 시 사용되는 비밀키
    }); // 검증
  }

  validate(payload: any) {
    return payload;
    return { userId: payload.sub, email: payload.email };
  }
} 

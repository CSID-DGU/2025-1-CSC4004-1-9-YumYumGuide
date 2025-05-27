import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import { UserService } from "src/user/user.service";
import { UserDocument } from "src/user/schemas/user.schema";

export class JwtAuthGuard extends AuthGuard('jwt') { }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          console.log('[JwtStrategy] Extracting token from cookie:', request?.cookies?.auth_token);
          return request?.cookies?.auth_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      passReqToCallback: true,
    });
    console.log('[JwtStrategy] Initialized');
  }

  async validate(req: any, payload: any): Promise<UserDocument> {
    console.log('[JwtStrategy] validate called. Payload:', payload);
    const token = req.cookies?.auth_token || req.headers.authorization?.split(' ')[1];
    console.log('[JwtStrategy] Token being validated:', token ? 'Token present' : 'Token NOT present');
    
    if (!token) {
      console.error('[JwtStrategy] No token provided');
      throw new UnauthorizedException('No token provided');
    }

    if (this.authService.isTokenBlacklisted(token)) {
      console.error('[JwtStrategy] Token is blacklisted');
      throw new UnauthorizedException('Token has been invalidated');
    }
    console.log('[JwtStrategy] Token is not blacklisted.');

    if (!payload || !payload.email) {
      console.error('[JwtStrategy] Payload or payload.email is missing. Payload:', payload);
      throw new UnauthorizedException('Invalid token payload');
    }
    console.log(`[JwtStrategy] Finding user by email: ${payload.email}`);
    const user = await this.userService.findByEmail(payload.email);
    
    if (!user) {
      console.error(`[JwtStrategy] User not found for email: ${payload.email}`);
      throw new UnauthorizedException('User not found');
    }
    console.log('[JwtStrategy] User found:', user.id, user.email);
    return user;
  }
} 

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { KakaoInformationRequestDTO } from "../auth.dto/authValidation";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(private authService: AuthService){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: `${process.env.JWT_SECRET_KEY}`,
    })
  }

  async validate(payload: KakaoInformationRequestDTO, done: VerifiedCallback): Promise<any> {
    const user = await this.authService.tokenValidateUser(payload);
    if (!user) {
      return done(new UnauthorizedException({ message: 'user does not exist' }), false);
    }

    return done(null, user);
  }
}
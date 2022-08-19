import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Environment } from '../../common/environment';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey:
        process.env.ENV == Environment.PRODUCTION
          ? process.env.JWT_PRIVATE_KEY
          : process.env.JWT_SECRET_KEY,
      algorithms:
        process.env.ENV == Environment.PRODUCTION ? ['RS256'] : undefined,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}

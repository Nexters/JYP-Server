import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: `${process.env.JWT_SECRET_KEY}`,
    });
  }

  async validate(payload: any) {
    const userOrNone = await this.userService.getUser(payload.id);
    if (userOrNone.isSome()) {
      return payload;
    } else {
      return null;
    }
  }
}

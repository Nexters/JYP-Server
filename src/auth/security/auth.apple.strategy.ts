import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from '@arendajaelu/nestjs-passport-apple';
import { DecodedIdToken, Strategy, VerifyCallback } from 'passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    console.info(process.env.DEV_APPLE_CLIENT_ID);
    super({
      clientID: process.env.DEV_APPLE_CLIENT_ID,
      teamID: process.env.DEV_APPLE_TEAM_ID,
      keyID: process.env.DEV_APPLE_KEY_ID,
      callbackURL: process.env.DEV_APPLE_CALLBACK_URL,
      privateKeyString: process.env.DEV_APPLE_KEY.replace(/\\n/g, '\n'),
      passReqToCallback: false,
    });
  }


  async validate(
    accessToken: string,
    idToken: string,
    profile: any,
    done: VerifyCallback,
  ) {

    const decodedIdToken: DecodedIdToken = this.jwtService.verify(idToken);

    console.log(decodedIdToken);

    const user = {
      provider: 'apple',
      snsId: decodedIdToken.sub,
      password: decodedIdToken.sub,
    };

    console.log(user);
    done(null, user);

  }
}
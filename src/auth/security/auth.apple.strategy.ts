import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@arendajaelu/nestjs-passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.DEV_APPLE_CLIENT_ID,
      teamID: process.env.DEV_APPLE_TEAM_ID,
      keyID: process.env.DEV_APPLE_KEY_ID,
      keyFilePath: process.env.DEV_APPLE_KEYFILE_PATH,
      callbackURL: process.env.DEV_APPLE_CALLBACK_URL,
      passReqToCallback: false,
      scope: ['email', 'name'],
    });
  }
}
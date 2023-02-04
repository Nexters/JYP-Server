import { Module, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './security/passport.jwt.strategy';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { AuthKakaoService } from './auth.kakao.service';
import { Environment } from '../common/environment';
import { JourneyModule } from '../journey/journey.module';
import { JourneyService } from '../journey/journey.service';
import { JourneyRepository } from '../journey/journey.repository';
import { Journey, JourneySchema } from '../journey/schemas/journey.schema';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      useFactory: () => {
        if (process.env.ENV == Environment.PRODUCTION) {
          return {
            publicKey: process.env.JWT_PUBLIC_KEY,
            privateKey: process.env.JWT_PRIVATE_KEY,
            signOptions: {
              expiresIn: '1h',
              issuer: 'journeypiki',
              algorithm: 'RS256',
            },
          };
        } else {
          return { secret: process.env.JWT_SECRET_KEY };
        }
      },
    }),
    PassportModule,
    UserModule,
    JourneyModule,
    MongooseModule.forFeature([
      { name: Journey.name, schema: JourneySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    AuthService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    JwtStrategy,
    UserService,
    UserRepository,
    JourneyService,
    JourneyRepository,
    AuthKakaoService,
  ],
  exports: [JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}

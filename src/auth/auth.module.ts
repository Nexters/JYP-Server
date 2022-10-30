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
import { AppleStrategy } from './security/auth.apple.strategy';

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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    AuthService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    JwtStrategy,
    AppleStrategy,
    UserService,
    UserRepository,
    AuthKakaoService,
  ],
  exports: [JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}

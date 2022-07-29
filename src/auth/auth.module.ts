import { Module, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth.security/passport.jwt.strategy';

@Module({
  imports: [HttpModule,
  JwtModule.register({
    secret: `${process.env.JWT_SECRET_KEY}`,
    signOptions: {expiresIn: '300s'}
  }),
    PassportModule
  ],
  providers: [AuthService, {
    provide: APP_PIPE,
    useClass: ValidationPipe
  }, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}

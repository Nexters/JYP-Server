import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './security/passport.jwt.strategy';
import { UserService } from '../user/user.service';
import { createMock } from 'ts-auto-mock';
import { AuthKakaoService } from './auth.kakao.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        JwtModule.register({
          secret: `${process.env.JWT_SECRET_KEY}`,
          signOptions: { expiresIn: '300s' },
        }),
        PassportModule,
      ],
      providers: [
        AuthService,
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
        JwtStrategy,
        UserService,
        AuthKakaoService,
      ],
      controllers: [AuthController],
    })
      .overrideProvider(UserService)
      .useValue(createMock<UserService>())
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

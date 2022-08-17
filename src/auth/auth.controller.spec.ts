import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './security/passport.jwt.strategy';
import { UserService } from '../user/user.service';
import { createMock } from 'ts-auto-mock';
import { AuthKakaoService } from './auth.kakao.service';
import { method, On } from 'ts-auto-mock/extension';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('kakaoLogin은 AuthService.validateKakaoUser를 ' +
    '호출해 토큰 혹은 토큰/카카오정보를 리턴한다', async () => {
    // given
    const getToken = On(authService)
      .get(method)

    // when

    // then
  })

});

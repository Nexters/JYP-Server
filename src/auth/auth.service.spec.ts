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
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserRepository } from '../user/user.repository';
import { method, On } from 'ts-auto-mock/extension';
import { Option } from 'prelude-ts';
import { PERSONALITY } from '../user/schemas/personality';
import { UserDTO } from '../user/dtos/user.dto';
import { KakaoLoginRequestDTO } from './dto/auth.dto';

const ID = 'id';
const NICKNAME = 'nickname';
const IMG = '/image/path';
const PSN = PERSONALITY.ME;
const userDTO = new UserDTO(ID, NICKNAME, IMG, PERSONALITY[PSN]);
const ACCESS_TOKEN = 'Bearer F43zy61WlAkM43Q0WEARqSozcbMTZjv0Bx8w_o16Cj11nAAAAYKrhju2';
const OK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imtha2FvLTIzNDY5MjYyNjYiLCJpYXQiOjE2NjA3MzUwODAsImV4cCI6MTY2MDczNTM4MH0.Ya4euRAWQCQpJjNR-UVBfHKOnzR2EPSuIHYtu2hJ2Sk'

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        JwtModule.register({
          secret: `${process.env.JWT_SECRET_KEY}`,
          signOptions: { expiresIn: '300s' },
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
        UserService,
        UserRepository,
        AuthKakaoService,
      ],
      controllers: [AuthController],
    })
      .overrideProvider(AuthService)
      .useValue(createMock<AuthService>())
      .compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('validateKakaoUser 는 유저가 최초 로그인이라면 카카오의 정보와 토큰을 리턴한다. ', async () => {
    // given
    const userOrNone = On(userService)
      .get(method(() => userService.getUser))
      .mockResolvedValue(Option.of(userDTO))

    // when
    const result = await authService.validateKakaoUser({accessToken: ACCESS_TOKEN});

    // then
  })
});

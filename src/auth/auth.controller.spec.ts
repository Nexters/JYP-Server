import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './security/passport.jwt.strategy';
import { createMock } from 'ts-auto-mock';
import { AuthKakaoService } from './auth.kakao.service';
import { method, On } from 'ts-auto-mock/extension';
import { KakaoLoginResponseDTO, KakaoSignUpResponseDTO } from './dto/auth.dto';

const ACCESS_TOKEN = 'Bearer F43zy61WlAkM43Q0WEARqSozcbMTZjv0Bx8w_o16Cj11nAAAAYKrhju2';
const OK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imtha2FvLTIzNDY5MjYyNjYiLCJpYXQiOjE2NjA3MzUwODAsImV4cCI6MTY2MDczNTM4MH0.Ya4euRAWQCQpJjNR-UVBfHKOnzR2EPSuIHYtu2hJ2Sk'
const authLoginDTO = new KakaoLoginResponseDTO(OK_TOKEN);
const authSignUpDTO = new KakaoSignUpResponseDTO(ACCESS_TOKEN, {
  token: null,
  id: null,
  connectedAt: null,
  properties: {
    nickname: null,
    profileImage: null,
    thumbnailImage: null
  },
  kakaoAccount: {
    profileNicknameNeedsAgreement: null,
    profileImageNeedsAgreement: null,
    profile: {
      nickname: null,
      thumbnailImageUrl: null,
      profileImageUrl: null,
      isDefaultImage: null,
    },
    hasEmail: null,
    emailNeedsAgreement: null,
    isEmailValid: null,
    isEmailVerified: null,
    email: "thd930308@naver.com",
    hasAgeRange: null,
    ageRangeNeedsAgreement: null,
    ageRange: null,
    hasBirthday: null,
    birthdayNeedsAgreement: null,
    birthday: null,
    birthdayType: null,
    hasGender: null,
    genderNeedsAgreement: null,
    gender: null,
  }
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let authKakaoService: AuthKakaoService;

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
        AuthKakaoService,
      ],
      controllers: [AuthController],
    })
      .overrideProvider(AuthService)
      .useValue(createMock<AuthService>())
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('kakaoLogin은 AuthService.validateKakaoUser를 호출해 토큰을 리턴한다', async () => {
    // given
    const validateKakaoUser = On(authService)
      .get(method(()=> authService.validateKakaoUser))
      .mockResolvedValue(authLoginDTO);

    // when
    const result = await authController.kakaoLogin(ACCESS_TOKEN);

    // then
    expect(validateKakaoUser).toBeCalledTimes(1);
    expect(validateKakaoUser).toBeCalledWith(ACCESS_TOKEN);
    expect(result).toEqual(authLoginDTO);
  })

  it('kakaoLogin은 AuthService.validateKakaoUser를 호출해 토큰과 정보를 리턴한다', async () => {
    //given
    const validateKakaoUser = On(authService)
      .get(method(() => authService.validateKakaoUser))
      .mockResolvedValue(authSignUpDTO);

    //when
    const result = await authController.kakaoLogin(ACCESS_TOKEN);

    //then
    expect(validateKakaoUser).toBeCalledTimes(1);
    expect(result).toEqual(authSignUpDTO);
  })
});



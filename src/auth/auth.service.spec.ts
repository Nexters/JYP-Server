import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { createMock } from 'ts-auto-mock';
import { method, On } from 'ts-auto-mock/extension';
import { AuthKakaoService } from './auth.kakao.service';
import { None, Option } from 'prelude-ts';
import { PERSONALITY } from '../user/schemas/personality';
import { UserDTO } from '../user/dtos/user.dto';
import { AuthVendor } from './authVendor';
import { JwtService } from '@nestjs/jwt';
import { KakaoSignUpResponseDTO } from './dto/auth.dto';

const ID = 'id';
const NICKNAME = 'nickname';
const IMG = '/image/path';
const PSN = PERSONALITY.ME;
const userDTO = new UserDTO(ID, NICKNAME, IMG, PERSONALITY[PSN]);
const ACCESS_TOKEN = 'Bearer F43zy61WlAkM43Q0WEARqSozcbMTZjv0Bx8w_o16Cj11nAAAAYKrhju2';
const OK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imtha2FvLTIzNDY5MjYyNjYiLCJpYXQiOjE2NjA3MzUwODAsImV4cCI6MTY2MDczNTM4MH0.Ya4euRAWQCQpJjNR-UVBfHKOnzR2EPSuIHYtu2hJ2Sk'

const KAKAO_ID = 123;
const OPTION_NONE = Option.none();
const GENERATED_ID = 'kakao-123';

const authSignUpDTO = new KakaoSignUpResponseDTO(ACCESS_TOKEN, {
  token: null,
  id: 123,
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

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let authKakaoService: AuthKakaoService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService, UserService, AuthKakaoService],
    })
      .overrideProvider(UserService)
      .useValue(createMock<UserService>())
      .overrideProvider(AuthKakaoService)
      .useValue(createMock<AuthKakaoService>())
      .overrideProvider(JwtService)
      .useValue(createMock<JwtService>())
      .compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    authKakaoService = module.get<AuthKakaoService>(AuthKakaoService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('validateKakaoUser 는 유저가 최초 로그인이라면 카카오의 정보와 토큰을 리턴한다. ', async () => {
    // given
    const kakaoInfo = On(authKakaoService)
      .get(method(()=> authKakaoService.getKakaoInfo))
      .mockResolvedValue(authSignUpDTO);

    const generateId = On(userService)
      .get(method( ()=> userService.generateId))
      .mockResolvedValue(GENERATED_ID)

    const userOrNone = On(userService)
      .get(method(() => userService.getUser))
      .mockResolvedValue(Option.none());

    On(jwtService)
      .get(method(()=> jwtService.sign))
      .mockResolvedValue(OK_TOKEN);

    const payload = { id: generateId };

    // when
    const result = await authService.validateKakaoUser(ACCESS_TOKEN as any);

    // then
    expect(generateId).toBeCalledTimes(1);
    expect(generateId).toBeCalledWith(AuthVendor.KAKAO, KAKAO_ID);
    expect(userOrNone).toBeCalledTimes(1);
  })
});

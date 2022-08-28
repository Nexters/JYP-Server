import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { createMock } from 'ts-auto-mock';
import { method, On } from 'ts-auto-mock/extension';
import { AuthKakaoService } from './auth.kakao.service';
import { Option } from 'prelude-ts';
import { AuthVendor } from './authVendor';
import { JwtService } from '@nestjs/jwt';
import { KakaoLoginResponseDTO, KakaoSignUpResponseDTO } from './dto/auth.dto';
import { toCamel } from 'snake-camel';
import { UserDTO } from '../user/dtos/user.dto';

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const OK_TOKEN = 'OK_TOKEN';

const KAKAO_ID = 123;
const GENERATED_ID = 'kakao-123';

const authSignUpDTO = new KakaoSignUpResponseDTO(OK_TOKEN, {
  token: null,
  id: 123,
  connectedAt: null,
  properties: {
    nickname: null,
    profileImage: null,
    thumbnailImage: null,
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
    email: 'thd930308@naver.com',
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
  },
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

  it('validateKakaoUser 는 유저가 최초 로그인이 아니라면 토큰을 리턴한다', async () => {
    // given
    const getKakaoInfo = On(authKakaoService)
      .get(method(() => authKakaoService.getKakaoInfo))
      .mockResolvedValue(authSignUpDTO);

    const generateId = On(userService)
      .get(method(() => userService.generateId))
      .mockResolvedValue(GENERATED_ID);

    const getUser = On(userService)
      .get(method(() => userService.getUser))
      .mockResolvedValue(
        Option.of(
          UserDTO.from({ _id: 'id', name: 'name', img: 'img', psn: 'psn' }),
        ),
      );

    const sign = On(jwtService)
      .get(method(() => jwtService.sign))
      .mockResolvedValue(OK_TOKEN);

    const payload = { id: await generateId() };

    // when
    const result = await authService.validateKakaoUser(ACCESS_TOKEN as any);

    // then
    expect(getKakaoInfo).toBeCalledTimes(1);
    expect(generateId).toBeCalledTimes(2);
    expect(generateId).toBeCalledWith(AuthVendor.KAKAO, KAKAO_ID);
    expect(getUser).toBeCalledTimes(1);
    expect(payload.id).toBe(GENERATED_ID);
    expect(result).toEqual(new KakaoLoginResponseDTO(sign(payload)));
  });

  it('validateKakaoUser 는 유저가 최초 로그인이라면 카카오의 정보와 토큰을 리턴한다. ', async () => {
    // given
    const getKakaoInfo = On(authKakaoService)
      .get(method(() => authKakaoService.getKakaoInfo))
      .mockResolvedValue(authSignUpDTO);

    const generateId = On(userService)
      .get(method(() => userService.generateId))
      .mockReturnValue(GENERATED_ID);

    console.info(generateId);

    const getUser = On(userService)
      .get(method(() => userService.getUser))
      .mockResolvedValue(Option.none());

    const sign = On(jwtService)
      .get(method(() => jwtService.sign))
      .mockResolvedValue(OK_TOKEN);

    const payload = { id: await generateId() };

    // when
    const result = await authService.validateKakaoUser(ACCESS_TOKEN as any);

    // then
    expect(getKakaoInfo).toBeCalledTimes(1);
    expect(generateId).toBeCalledTimes(2);
    expect(generateId).toBeCalledWith(AuthVendor.KAKAO, KAKAO_ID);
    expect(getUser).toBeCalledTimes(1);
    expect(getUser).toBeCalledWith(GENERATED_ID);
    expect(payload.id).toBe(GENERATED_ID);
    expect(result).toEqual(
      new KakaoSignUpResponseDTO(
        await sign(payload),
        toCamel(await getKakaoInfo()),
      ),
    );
  });
});

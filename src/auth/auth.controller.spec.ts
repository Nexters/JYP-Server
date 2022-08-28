import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createMock } from 'ts-auto-mock';
import { method, On } from 'ts-auto-mock/extension';
import { KakaoSignUpResponseDTO } from './dto/auth.dto';

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const authSignUpDTO = new KakaoSignUpResponseDTO(ACCESS_TOKEN, {
  token: null,
  id: null,
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

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
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
  });
});

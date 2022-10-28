import { ApiProperty } from '@nestjs/swagger';
import {
  KakaoUserInformation,
  KakaoLoginRequest,
  KakaoLoginResponse,
  AppleUserInformation,
  AppleLoginResponse,
} from './auth.interface';
import { IsString, Length } from 'class-validator';

export class KakaoLoginRequestDTO implements KakaoLoginRequest {
  @ApiProperty({
    example: 'auth/kakao/userinfo/액세스토큰',
    description: '카카오 Access Token 전달',
    required: true,
  })
  @Length(50, 60)
  @IsString()
  public accessToken: string;
}

export class AppleSignUpResponseDTO implements AppleUserInformation {
  constructor(token, value?) {
    this.token = token;
    this.iss = value.iss;
    this.aud = value.aud;
    this.exp = value.exp;
    this.iat = value.iat;
    this.sub = value.sub;
    this.cHash = value.c_hash;
    this.email = value.email;
    this.emailVerified = value.emailVerified;
    this.authTime = value.authTime;
    this.nonceSupported = value.nonceSupported;
  }

  readonly token: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  cHash: string;
  email: string;
  emailVerified: string;
  authTime: number;
  nonceSupported: boolean;
}

export class KakaoSignUpResponseDTO implements KakaoUserInformation {
  constructor(token, value?) {
    this.token = token;
    this.id = value.id;
    this.connectedAt = value.connected_at;
    this.properties = value.properties;
    this.kakaoAccount = value.kakaoAccount;
  }

  readonly token: string;

  readonly id: string;
  readonly connectedAt: string;

  properties: {
    readonly nickname: string;
    profileImage: string;
    thumbnailImage: string;
  };

  kakaoAccount: {
    profileNicknameNeedsAgreement: boolean;
    profileImageNeedsAgreement: boolean;
    profile: {
      nickname: string;
      thumbnailImageUrl: string;
      profileImageUrl: string;
      isDefaultImage: string;
    };
    hasEmail: boolean;
    emailNeedsAgreement: boolean;
    isEmailValid: boolean;
    isEmailVerified: boolean;
    email: string;
    hasAgeRange: boolean;
    ageRangeNeedsAgreement: boolean;
    ageRange: string;
    hasBirthday: boolean;
    birthdayNeedsAgreement: boolean;
    birthday: string;
    birthdayType: string;
    hasGender: boolean;
    genderNeedsAgreement: boolean;
    gender: string;
  };
}

export class KakaoLoginResponseDTO implements KakaoLoginResponse {
  @ApiProperty({
    example: 'auth/kakao/login',
    description: '카카오 로그인 Req 후 JWT 토큰 전달',
    required: true,
  })
  @IsString()
  readonly token: string;

  constructor(token) {
    this.token = token;
  }
}

export class AppleLoginResponseDTO implements AppleLoginResponse {
  @ApiProperty({
    example: 'auth/apple/login',
    description: '애플 로그인 Req 후 JWT 토큰 전달',
    required: true,
  })
  @IsString()
  readonly token: string;

  constructor(token) {
    this.token = token;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import {
  KakaoUserInformation,
  KakaoUserInfoRequest,
  KakaoLoginRequest,
  KakaoLoginResponse,
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

export class KakaoLoginResponseDTO implements KakaoLoginResponse {
  @ApiProperty({
    example: 'auth/kakao/login',
    description: '카카오 로그인 Req 후 JWT 토큰 전달',
    required: true,
  })
  @IsString()
  public token: string;

  constructor(token) {
    this.token = token;
  }
}

export class KakaoInformationRequestDTO implements KakaoUserInfoRequest {
  public accessToken: string;
}

export class KakaoSignUpResponseDTO implements KakaoUserInformation {
  constructor(token, value?) {
    this.token = token;
    this.id = value.id;
    this.connected_at = value.connected_at;
    this.properties = value.properties;
    this.kakao_account = value.kakao_account;
  }
  readonly token: string;

  readonly id: number;
  readonly connected_at: string;

  readonly properties: {
    readonly nickname: string;
    readonly profile_image: string;
    readonly thumbnail_image: string;
  };

  readonly kakao_account: {
    readonly profile_nickname_needs_agreement: boolean;
    readonly profile_image_needs_agreement: boolean;
    readonly profile: object;
    readonly has_email: boolean;
    readonly email_needs_agreement: boolean;
    readonly is_email_valid: boolean;
    readonly is_email_verified: boolean;
    readonly email: string;
    readonly has_age_range: boolean;
    readonly age_range_needs_agreement: boolean;
    readonly age_range: string;
    readonly has_birthday: boolean;
    readonly birthday_needs_agreement: boolean;
    readonly birthday: string;
    readonly birthday_type: string;
    readonly has_gender: boolean;
    readonly gender_needs_agreement: boolean;
    readonly gender: string;
  };
}

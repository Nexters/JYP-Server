import { ApiProperty } from '@nestjs/swagger';
import {
  KakaoUserInformation,
  KakaoUserInfoRequest,
  KakaoLoginRequest,
} from './interface';
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

export class KakaoLoginResponseDTO {
  @ApiProperty({
    example: 'auth/kakao/userinfo/액세스토큰',
    description: '카카오 Access Token 전달',
    required: true,
  })
  @IsString()
  public accessToken: string;
}

export class KakaoInformationRequestDTO implements KakaoUserInfoRequest {
  public accessToken: string;
}

export class KakaoInformationResponseDTO implements KakaoUserInformation {
  public id: number;
  public connected_at: string;

  public properties: {
    nickname: string;
    profile_image: string;
    thumbnail_image: string;
  };
  kakao_account: {
    profile_nickname_needs_agreement: boolean;
    profile_image_needs_agreement: boolean;
    profile: object;
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email: string;
    has_age_range: boolean;
    age_range_needs_agreement: boolean;
    age_range: string;
    has_birthday: boolean;
    birthday_needs_agreement: boolean;
    birthday: string;
    birthday_type: string;
    has_gender: boolean;
    gender_needs_agreement: boolean;
    gender: string;
  };
}

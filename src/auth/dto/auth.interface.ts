export interface KakaoLoginRequest {
  accessToken: string;
}

export interface KakaoLoginResponse {
  token: string;
}

export interface AppleLoginResponse {
  token: string;
}

export interface AppleUserInformation {
  iss: string,
  aud: string,
  exp: number,
  iat: number,
  sub: string,
  c_hash: string,
  email: string,
  email_verified: string,
  auth_time: number,
  nonce_supported: boolean
}

export interface KakaoUserInformation {
  id: string;
  connectedAt?: string;
  properties?: {
    nickname: string;
    profileImage: string;
    thumbnailImage: string;
  };
  kakaoAccount?: {
    profileNicknameNeedsAgreement: boolean;
    profileImageNeedsAgreement: boolean;
    profile: object;
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

export interface KakaoUserInfoRequest {
  accessToken: string;
}

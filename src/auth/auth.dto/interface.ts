export interface IKakaoLoginRequest {
  accessToken: string
}

export interface IKakaoUserInformation {
  id: number,
  connected_at: string,
  properties: {
    nickname: string,
    profile_image: string,
    thumbnail_image: string
  },
  kakao_account: {
    profile_nickname_needs_agreement: boolean,
    profile_image_needs_agreement: boolean,
    profile: object,
    has_email: boolean,
    email_needs_agreement: boolean,
    is_email_valid: boolean,
    is_email_verified: boolean,
    email: string,
    has_age_range: boolean,
    age_range_needs_agreement: boolean,
    age_range: string,
    has_birthday: boolean,
    birthday_needs_agreement: boolean,
    birthday: string,
    birthday_type: string,
    has_gender: boolean,
    gender_needs_agreement: boolean,
    gender: string
  }
}

export interface IKakaoUserInfoRequest {
  accessToken: string
}
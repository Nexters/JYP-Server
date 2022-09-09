import {
  UserResponse,
  UserCreateRequest,
  UserUpdateRequest,
} from './user.interface';
import { User } from '../schemas/user.schema';
import { PERSONALITY } from '../schemas/personality';
import { ApiProperty } from '@nestjs/swagger';
import { AuthVendor } from '../../auth/authVendor';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import {
  IS_EMUN_MSG,
  IS_IN_MSG,
  IS_NOT_EMPTY_MSG,
  MAX_LENGTH_MSG,
} from '../../common/validation/validation.messages';

export class UserResponseDTO implements UserResponse {
  @ApiProperty({
    description: '유저 ID',
  })
  readonly id: string;

  @ApiProperty({
    description: '유저 이름',
  })
  readonly name: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
  })
  readonly profileImagePath: string;

  @ApiProperty({
    description: '유저 성향',
  })
  readonly personality: string;

  static from(user: User): UserResponseDTO {
    return new UserResponseDTO(
      user._id,
      user.name,
      user.img,
      PERSONALITY[user.psn],
    );
  }

  constructor(
    id: string,
    name: string,
    profileImagePath: string,
    personality: string,
  ) {
    this.id = id;
    this.name = name;
    this.profileImagePath = profileImagePath;
    this.personality = personality;
  }
}

export class UserCreateRequestDTO implements UserCreateRequest {
  @ApiProperty({
    type: String,
    description: 'Auth 연동을 제공하는 벤더의 이름',
    enum: Object.values(AuthVendor),
  })
  @IsEnum(AuthVendor, { message: IS_EMUN_MSG })
  readonly authVendor: AuthVendor;

  @ApiProperty({
    description: 'Auth 벤더가 제공하는 유저 ID',
  })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly authId: string;

  @ApiProperty({
    description: '유저 이름',
    maxLength: 10,
  })
  @IsNotEmpty()
  @MaxLength(10, { message: MAX_LENGTH_MSG })
  readonly name: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
  })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly profileImagePath: string;

  @ApiProperty({
    description: '유저 성향 ID',
    enum: Object.keys(PERSONALITY),
  })
  @IsIn(Object.keys(PERSONALITY), { message: IS_IN_MSG })
  readonly personalityId: string;

  constructor(
    authVendor: AuthVendor,
    authId: string,
    name: string,
    profileImagePath: string,
    personalityId: string,
  ) {
    this.authVendor = authVendor;
    this.authId = authId;
    this.name = name;
    this.profileImagePath = profileImagePath;
    this.personalityId = personalityId;
  }
}

export class UserUpdateRequestDTO implements UserUpdateRequest {
  @ApiProperty({
    description: '유저 이름',
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @MaxLength(10, { message: MAX_LENGTH_MSG })
  readonly name: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
    required: false,
  })
  @IsOptional()
  readonly profileImagePath: string;

  constructor(name: string, profileImagePath: string) {
    this.name = name;
    this.profileImagePath = profileImagePath;
  }
}

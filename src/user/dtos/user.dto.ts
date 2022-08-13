import { User, UserCreate, UserUpdate } from './user.interface';
import { User as UserDoc } from '../schemas/user.schema';
import { PERSONALITY } from '../schemas/personality';
import { ApiProperty } from '@nestjs/swagger';
import { AuthVendor } from '../../auth/authVendor';
import { IsEnum } from 'class-validator';

export class UserDTO implements User {
  @ApiProperty({
    description: '유저 ID',
  })
  readonly id: string;

  @ApiProperty({
    description: '유저 닉네임',
  })
  readonly nickname: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
  })
  readonly profileImagePath: string;

  @ApiProperty({
    description: '유저 성향',
  })
  readonly personality: string;

  static from(user: UserDoc): UserDTO {
    return new UserDTO(user._id, user.name, user.img, PERSONALITY[user.psn]);
  }

  constructor(
    id: string,
    nickname: string,
    profileImagePath: string,
    personality: string,
  ) {
    this.id = id;
    this.nickname = nickname;
    this.profileImagePath = profileImagePath;
    this.personality = personality;
  }
}

export class UserCreateDTO implements UserCreate {
  @ApiProperty({
    type: String,
    description: 'Auth 연동을 제공하는 벤더의 이름',
    enum: Object.values(AuthVendor),
  })
  @IsEnum(AuthVendor)
  readonly authVendor: AuthVendor;

  @ApiProperty({
    description: 'Auth 벤더가 제공하는 유저 ID',
  })
  readonly authId: string;

  @ApiProperty({
    description: '유저 닉네임',
  })
  readonly nickname: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
  })
  readonly profileImagePath: string;

  @ApiProperty({
    description: '유저 성향 ID',
    enum: Object.keys(PERSONALITY),
  })
  readonly personalityId: string;

  constructor(
    authVendor: AuthVendor,
    authId: string,
    nickname: string,
    profileImagePath: string,
    personalityId: string,
  ) {
    this.authVendor = authVendor;
    this.authId = authId;
    this.nickname = nickname;
    this.profileImagePath = profileImagePath;
    this.personalityId = personalityId;
  }
}

export class UserUpdateDTO implements UserUpdate {
  @ApiProperty({
    description: '유저 닉네임',
    required: false,
  })
  readonly nickname: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
    required: false,
  })
  readonly profileImagePath: string;

  constructor(nickname: string, profileImagePath: string) {
    this.nickname = nickname;
    this.profileImagePath = profileImagePath;
  }
}

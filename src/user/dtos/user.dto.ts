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
  id: string;

  @ApiProperty({
    description: '유저 닉네임',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
  })
  profileImagePath: string;

  @ApiProperty({
    description: '유저 성향',
  })
  personality: string;

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
  authVendor: AuthVendor;

  @ApiProperty({
    description: 'Auth 벤더가 제공하는 유저 ID',
  })
  authId: string;

  @ApiProperty({
    description: '유저 닉네임',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
  })
  profileImagePath: string;

  @ApiProperty({
    description: '유저 성향',
    enum: Object.keys(PERSONALITY),
  })
  personality: string;

  constructor(
    authVendor: AuthVendor,
    authId: string,
    nickname: string,
    profileImagePath: string,
    personality: string,
  ) {
    this.authVendor = authVendor;
    this.authId = authId;
    this.nickname = nickname;
    this.profileImagePath = profileImagePath;
    this.personality = personality;
  }
}

export class UserUpdateDTO implements UserUpdate {
  @ApiProperty({
    description: '유저 닉네임',
    required: false,
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 경로',
    required: false,
  })
  profileImagePath: string;

  constructor(nickname: string, profileImagePath: string) {
    this.nickname = nickname;
    this.profileImagePath = profileImagePath;
  }
}

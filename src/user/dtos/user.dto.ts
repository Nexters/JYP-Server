import { User, UserUpdate } from './user.interface';
import { User as UserDoc } from '../schemas/user.schema';
import { PERSONALITY } from '../schemas/personality';
import { ApiProperty } from '@nestjs/swagger';

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

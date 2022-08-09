import { User, UserUpdate } from './user.interface';
import { User as UserDoc } from '../schemas/user.schema';
import { PERSONALITY } from '../schemas/personality';

export class UserDTO implements User {
  id: string;
  nickname: string;
  profileImagePath: string;
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
  nickname: string;
  profileImagePath: string;

  constructor(nickname: string, profileImagePath: string) {
    this.nickname = nickname;
    this.profileImagePath = profileImagePath;
  }
}

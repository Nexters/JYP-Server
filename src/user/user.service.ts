import { Injectable } from '@nestjs/common';
import { UserDTO, UserUpdateDTO } from './dtos/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async getUser(id: string): Promise<UserDTO> {
    return UserDTO.from(await this.userRepository.findOne(id));
  }

  public async updateUser(
    id: string,
    userUpdateDTO: UserUpdateDTO,
  ): Promise<UserDTO> {
    return UserDTO.from(
      await this.userRepository.updateOne(
        id,
        userUpdateDTO.nickname,
        userUpdateDTO.profileImagePath,
      ),
    );
  }

  public async createUser(
    id: string,
    nickname: string,
    profileImagePath: string,
    personality: string,
  ) {
    return UserDTO.from(
      await this.userRepository.insertOne(
        id,
        nickname,
        profileImagePath,
        personality,
      ),
    );
  }
}

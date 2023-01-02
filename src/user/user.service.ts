import { Injectable } from '@nestjs/common';
import { Option } from 'prelude-ts';
import {
  NotFoundUserException
} from '../common/exceptions';
import {
  UserCreateRequestDTO,
  UserDeleteResponseDTO,
  UserResponseDTO,
  UserUpdateRequestDTO,
} from './dtos/user.dto';
import { UserRepository } from './user.repository';
import { INVALID_ID_IN_JWT_MSG } from '../common/validation/validation.messages';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async getUser(id: string): Promise<Option<UserResponseDTO>> {
    const user = await this.userRepository.findOne(id);
    if (user == null) {
      return Option.none();
    } else {
      return Option.of(UserResponseDTO.from(user));
    }
  }

  public async updateUser(
    id: string,
    userUpdateDTO: UserUpdateRequestDTO,
  ): Promise<UserResponseDTO> {
    return UserResponseDTO.from(
      await this.userRepository.updateOne(
        id,
        userUpdateDTO.name,
        userUpdateDTO.profileImagePath,
      ),
    );
  }

  public async createUser(
    userCreateDTO: UserCreateRequestDTO,
    userId: string,
  ): Promise<UserResponseDTO> {
    return UserResponseDTO.from(
      await this.userRepository.insertOne(
        userId,
        userCreateDTO.name,
        userCreateDTO.profileImagePath,
        userCreateDTO.personalityId,
      ),
    );
  }

  public async deleteUser(userId: string): Promise<UserDeleteResponseDTO> {
    const result = await this.userRepository.deleteOne(userId);
    if (!result.deletedCount) throw new NotFoundUserException(INVALID_ID_IN_JWT_MSG)
    return result;
  }
}

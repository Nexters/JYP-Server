import { Injectable } from '@nestjs/common';
import { Option } from 'prelude-ts';
import { AuthVendor } from '../auth/authVendor';
import { UserCreateDTO, UserDTO, UserUpdateDTO } from './dtos/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async getUser(id: string): Promise<Option<UserDTO>> {
    const user = await this.userRepository.findOne(id);
    if (user == null) {
      return Option.none();
    } else {
      return Option.of(UserDTO.from(user));
    }
  }

  public async updateUser(
    id: string,
    userUpdateDTO: UserUpdateDTO,
  ): Promise<UserDTO> {
    return UserDTO.from(
      await this.userRepository.updateOne(
        id,
        userUpdateDTO.name,
        userUpdateDTO.profileImagePath,
      ),
    );
  }

  public async createUser(userCreateDTO: UserCreateDTO): Promise<UserDTO> {
    const id = this.generateId(userCreateDTO.authVendor, userCreateDTO.authId);
    return UserDTO.from(
      await this.userRepository.insertOne(
        id,
        userCreateDTO.name,
        userCreateDTO.profileImagePath,
        userCreateDTO.personalityId,
      ),
    );
  }

  public generateId(authVendor: AuthVendor, authId: string) {
    return `${authVendor}-${authId}`;
  }
}

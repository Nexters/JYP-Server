import { Injectable, Logger } from '@nestjs/common';
import { Option } from 'prelude-ts';
import {
  NotFoundUserException,
  UserDeletionFailedException,
} from '../common/exceptions';
import {
  UserCreateRequestDTO,
  UserDeleteResponseDTO,
  UserResponseDTO,
  UserUpdateRequestDTO,
} from './dtos/user.dto';
import { UserRepository } from './user.repository';
import { JourneyRepository } from '../journey/journey.repository';
import { JourneyService } from '../journey/journey.service';
import { USER_DELETION_FAILED_MSG } from '../http/http-exception.messages';
import { INVALID_ID_IN_JWT_MSG } from '../common/validation/validation.messages';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly journeyRepository: JourneyRepository,
    private readonly journeyService: JourneyService,
  ) {}

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
    const user = await this.userRepository.findOne(userId);
    if (user == null) {
      throw new NotFoundUserException(INVALID_ID_IN_JWT_MSG);
    }
    const journeys = await this.journeyRepository.listByUser(user);
    for (const journey of journeys) {
      const journeyId = journey._id.toString();
      try {
        await this.journeyService.deleteUserFromJourney(journeyId, userId);
      } catch (e) {
        Logger.warn(
          `An error occurred during deleting user ${userId}, deleting all of its data from ${journeyId}. \n${e.message}`,
        );
        throw new UserDeletionFailedException(USER_DELETION_FAILED_MSG);
      }
    }
    const result = await this.userRepository.deleteOne(userId);
    if (result.deletedCount == 0) {
      throw new UserDeletionFailedException(USER_DELETION_FAILED_MSG);
    }
    return result;
  }
}

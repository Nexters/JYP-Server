import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  INDEX_OUT_OF_RANGE_MSG,
  INVALID_ID_IN_JWT_MSG,
  JOURNEY_EXCEEDED_MSG,
  JOURNEY_NOT_EXIST_MSG,
  PIKMI_EXCEEDED_MSG,
  USER_EXCEEDED_MSG,
  USER_NOT_IN_JOURNEY_MSG,
} from '../common/validation/validation.messages';
import {
  IndexOutOfRangeException,
  InvalidJwtPayloadException,
  JourneyNotExistException,
  LimitExceededException,
  UnauthenticatedException,
} from '../common/exceptions';
import { createEmptyNestedArray, getDayDiff } from '../common/util';
import { UserRepository } from '../user/user.repository';
import {
  JourneyCreateDTO,
  IdResponseDTO,
  PikmiCreateDTO,
  PikiUpdateDTO,
  PikisUpdateDTO,
  IdsResponseDTO,
  TagsUpdateDTO,
} from './dtos/journey.dto';
import { JourneyRepository } from './journey.repository';
import {
  Journey,
  JourneyDocument,
  Piki,
  Pikmi,
  Tag,
} from './schemas/journey.schema';
import {
  MAX_JOURNEY_PER_USER,
  MAX_PIKMI_PER_JOURNEY,
  MAX_USER_PER_JOURNEY,
} from '../common/validation/validation.constants';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class JourneyService {
  constructor(
    private readonly journeyRepository: JourneyRepository,
    private readonly userRepository: UserRepository,
    @InjectModel(Journey.name)
    private readonly journeyModel: Model<JourneyDocument>,
  ) {}

  public async createJourney(
    journeyCreateDto: JourneyCreateDTO,
    userId: string,
  ): Promise<IdResponseDTO> {
    const user = await this.userRepository.findOne(userId);
    if (user == null) {
      throw new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG);
    }
    const existingJourneys = await this.journeyRepository.listByUser(
      user,
      false,
    );
    if (existingJourneys.length >= MAX_JOURNEY_PER_USER) {
      throw new LimitExceededException(JOURNEY_EXCEEDED_MSG);
    }
    const tags: Tag[] = journeyCreateDto.tags.map((tagCreateDto) => {
      return new Tag(tagCreateDto.topic, tagCreateDto.orientation, user);
    });
    const dayDiff = getDayDiff(
      journeyCreateDto.startDate,
      journeyCreateDto.endDate,
    );
    const journey = new Journey(
      journeyCreateDto.name,
      journeyCreateDto.startDate,
      journeyCreateDto.endDate,
      journeyCreateDto.themePath,
      [user],
      tags,
      [],
      createEmptyNestedArray(dayDiff),
    );
    const journeyDoc: JourneyDocument = new this.journeyModel(journey);
    const savedJourney = await this.journeyRepository.insert(journeyDoc);
    return new IdResponseDTO(savedJourney._id.toString());
  }

  public async createPikmi(
    pikmiCreateDto: PikmiCreateDTO,
    journeyId: string,
    userId: string,
  ) {
    const user = await this.userRepository.findOne(userId);
    const journey = await this.journeyRepository.get(journeyId, false);
    JourneyService.preCheck(user, journey);
    if (journey.pikmis.length >= MAX_PIKMI_PER_JOURNEY) {
      throw new LimitExceededException(PIKMI_EXCEEDED_MSG);
    }
    const pikmi = Pikmi.create(
      pikmiCreateDto.name,
      pikmiCreateDto.address,
      pikmiCreateDto.category,
      [],
      pikmiCreateDto.longitude,
      pikmiCreateDto.latitude,
      pikmiCreateDto.link,
    );
    journey.pikmis.push(pikmi);
    await this.journeyRepository.update(journey);
    return new IdResponseDTO(pikmi._id.toString());
  }

  public async updatePiki(
    pikisUpdateDto: PikisUpdateDTO,
    journeyId: string,
    userId: string,
  ) {
    const user = await this.userRepository.findOne(userId);
    const journey = await this.journeyRepository.get(journeyId, false);
    JourneyService.preCheck(user, journey);
    if (pikisUpdateDto.index >= journey.pikis.length) {
      throw new IndexOutOfRangeException(INDEX_OUT_OF_RANGE_MSG);
    }
    const idGeneratedPikis = pikisUpdateDto.pikis.map(JourneyService.toPiki);
    journey.pikis[pikisUpdateDto.index] = idGeneratedPikis;
    await this.journeyRepository.update(journey);
    return new IdsResponseDTO(...idGeneratedPikis.map((_) => _._id.toString()));
  }

  private static toPiki(pikiUpdateDto: PikiUpdateDTO) {
    if (pikiUpdateDto.id) {
      return new Piki(
        pikiUpdateDto.id,
        pikiUpdateDto.name,
        pikiUpdateDto.address,
        pikiUpdateDto.category,
        pikiUpdateDto.longitude,
        pikiUpdateDto.latitude,
        pikiUpdateDto.link,
      );
    } else {
      return Piki.create(
        pikiUpdateDto.name,
        pikiUpdateDto.address,
        pikiUpdateDto.category,
        pikiUpdateDto.longitude,
        pikiUpdateDto.latitude,
        pikiUpdateDto.link,
      );
    }
  }

  public async updateTags(
    tagsUpdateDto: TagsUpdateDTO,
    journeyId: string,
    userId: string,
  ) {
    const user = await this.userRepository.findOne(userId);
    const journey = await this.journeyRepository.get(journeyId, false);
    JourneyService.preCheck(user, journey);
    const tagDeletedJourney = await this.journeyRepository.deleteTags(
      journeyId,
      userId,
    );
    for (const tagUpdateDto of tagsUpdateDto.tags) {
      const tag = new Tag(tagUpdateDto.topic, tagUpdateDto.orientation, user);
      tagDeletedJourney.tags.push(tag);
    }
    await this.journeyRepository.update(tagDeletedJourney);
  }

  public async addUserToJourney(journeyId: string, userId: string) {
    const user = await this.userRepository.findOne(userId);
    const journey = await this.journeyRepository.get(journeyId, false);
    JourneyService.preCheck(user, journey, false);
    if (journey.users.length >= MAX_USER_PER_JOURNEY) {
      throw new LimitExceededException(USER_EXCEEDED_MSG);
    }
    journey.users.push(user);
    return await this.journeyRepository.update(journey);
  }

  public async deleteUserFromJourney(journeyId: string, userId: string) {
    const user = await this.userRepository.findOne(userId);
    const journey = await this.journeyRepository.get(journeyId, false);
    JourneyService.preCheck(user, journey, true);
    await this.journeyRepository.deleteTags(journeyId, userId);
    await this.journeyRepository.deleteAllPikmiLikeBy(journeyId, userId);
    const userDeletedJourney = await this.journeyRepository.deleteUser(
      journeyId,
      userId,
    );
    if (userDeletedJourney.users.length == 0) {
      await this.journeyRepository.delete(userDeletedJourney);
    }
  }

  private static preCheck(user: User, journey: Journey, userInJourney = true) {
    if (user == null) {
      throw new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG);
    }
    if (journey == null) {
      throw new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG);
    }
    if (
      userInJourney &&
      JourneyService.getUserIndex(user, journey.users) == -1
    ) {
      throw new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG);
    }
  }

  private static getUserIndex(user: User, users: User[] | string[]): number {
    if (this.isPopulated(users)) {
      const userIds = users.map((_) => _._id);
      return userIds.indexOf(user._id);
    } else {
      return users.indexOf(user._id);
    }
  }

  private static isPopulated(users: User[] | string[]): users is User[] {
    if (users.length == 0) {
      return false;
    }
    return !(typeof users[0] == 'string');
  }
}

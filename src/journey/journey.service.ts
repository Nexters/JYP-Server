import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  INDEX_OUT_OF_RANGE_MSG,
  INVALID_ID_IN_JWT_MSG,
  JOURNEY_EXCEEDED_MSG,
  JOURNEY_NOT_EXIST_MSG,
  PIKMI_EXCEEDED_MSG,
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
  TagCreateDTO,
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
      return new Tag(tagCreateDto.topic, tagCreateDto.orientation, [user]);
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
    if (user == null) {
      throw new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG);
    }
    const journey = await this.journeyRepository.get(journeyId, false);
    if (journey == null) {
      throw new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG);
    }
    if (this.getUserIndex(user, journey.users) == -1) {
      throw new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG);
    }
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
    if (user == null) {
      throw new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG);
    }
    const journey = await this.journeyRepository.get(journeyId, false);
    if (journey == null) {
      throw new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG);
    }
    if (this.getUserIndex(user, journey.users) == -1) {
      throw new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG);
    }
    if (pikisUpdateDto.index >= journey.pikis.length) {
      throw new IndexOutOfRangeException(INDEX_OUT_OF_RANGE_MSG);
    }
    const idGeneratedPikis = pikisUpdateDto.pikis.map(this.toPiki);
    journey.pikis[pikisUpdateDto.index] = idGeneratedPikis;
    await this.journeyRepository.update(journey);
    return new IdsResponseDTO(...idGeneratedPikis.map((_) => _._id.toString()));
  }

  private toPiki(pikiUpdateDto: PikiUpdateDTO) {
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
    if (user == null) {
      throw new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG);
    }
    const journey = await this.journeyRepository.get(journeyId, false);
    if (journey == null) {
      throw new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG);
    }
    if (this.getUserIndex(user, journey.users) == -1) {
      throw new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG);
    }
    const tagsForUpdate = tagsUpdateDto.tags;
    for (const tag of journey.tags) {
      const tagIndex = this.getTagIndex(tag, tagsForUpdate);
      const userIndex = this.getUserIndex(user, tag.users);
      if (tagIndex != -1) {
        if (userIndex == -1) {
          tag.users.push(user);
        }
        tagsForUpdate.splice(tagIndex, 1);
      } else {
        if (userIndex != -1) {
          tag.users.splice(userIndex, 1);
        }
      }
    }
    for (const tagForUpdate of tagsForUpdate) {
      const tag = new Tag(tagForUpdate.topic, tagForUpdate.orientation, [user]);
      journey.tags.push(tag);
    }
    journey.tags = this.cleanTagsWithNoUser(journey.tags);
    await this.journeyRepository.update(journey);
  }

  private getTagIndex(tag: Tag, tagsForUpdate: TagCreateDTO[]): number {
    for (let i = 0; i < tagsForUpdate.length; i++) {
      if (
        tag.topic == tagsForUpdate[i].topic &&
        tag.orient == tagsForUpdate[i].orientation
      ) {
        return i;
      }
    }
    return -1;
  }

  private getUserIndex(user: User, users: User[] | string[]): number {
    if (this.isPopulated(users)) {
      const userIds = users.map((_) => _._id);
      return userIds.indexOf(user._id);
    } else {
      return users.indexOf(user._id);
    }
  }

  private isPopulated(users: User[] | string[]): users is User[] {
    if (users.length == 0) {
      return false;
    }
    return !(typeof users[0] == 'string');
  }

  private cleanTagsWithNoUser(tags: Tag[]): Tag[] {
    const tagIdxToClean = [];
    for (let i = tags.length - 1; i >= 0; i--) {
      if (tags[i].users.length == 0) {
        tagIdxToClean.push(i);
      }
    }
    for (const idx of tagIdxToClean) {
      tags.splice(idx, 1);
    }
    return tags;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  INVALID_ID_IN_JWT_MSG,
  JOURNEY_EXCEEDED_MSG,
} from '../common/validation/validation.messages';
import {
  InvalidJwtPayloadException,
  LimitExceededException,
} from '../common/exceptions';
import { createEmptyNestedArray, getDayDiff } from '../common/util';
import { UserRepository } from '../user/user.repository';
import { JourneyCreateDTO, IdResponseDTO } from './dtos/journey.dto';
import { JourneyRepository } from './journey.repository';
import { Journey, JourneyDocument, Tag } from './schemas/journey.schema';
import { MAX_JOURNEY_PER_USER } from '../common/validation/validation.constants';

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
    const savedJourney = await this.journeyRepository.insertOne(journeyDoc);
    return new IdResponseDTO(savedJourney._id.toString());
  }
}

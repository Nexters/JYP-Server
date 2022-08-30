import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JOURNEY_EXCEEDED_MSG } from '../common/validation/validation.messages';
import { LimitExceededException } from '../common/exceptions';
import { createEmptyNestedArray, getDayDiff } from '../common/util';
import { UserRepository } from '../user/user.repository';
import { JourneyCreateDto, IdResponseDto } from './dtos/journey.dto';
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
    journeyCreateDto: JourneyCreateDto,
    userId: string,
  ): Promise<IdResponseDto> {
    const user = await this.userRepository.findOne(userId);
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
    const journey: JourneyDocument = new this.journeyModel({
      name: journeyCreateDto.name,
      start: journeyCreateDto.startDate,
      end: journeyCreateDto.endDate,
      theme: journeyCreateDto.themePath,
      users: [user],
      tags: tags,
      pikmis: [],
      pikis: createEmptyNestedArray(dayDiff),
    });
    const savedJourney = await this.journeyRepository.insertOne(journey);
    return new IdResponseDto(savedJourney._id.toString());
  }
}

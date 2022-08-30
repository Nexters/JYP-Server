import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { UserRepository } from '../user/user.repository';
import { JourneyRepository } from './journey.repository';
import { JourneyService } from './journey.service';
import { Journey, JourneyDocument, Tag } from './schemas/journey.schema';
import {
  IdResponseDTO,
  JourneyCreateDTO,
  TagCreateDTO,
} from './dtos/journey.dto';
import { User } from '../user/schemas/user.schema';
import { LimitExceededException } from '../common/exceptions';
import { JOURNEY_EXCEEDED_MSG } from '../common/validation/validation.messages';
import { MAX_JOURNEY_PER_USER } from '../common/validation/validation.constants';

const JOURNEY_NAME = 'name';
const START_DATE = 1661299200;
const END_DATE = 1661558400; // 3일 차이
const THEME_PATH = 'path';
const FIRST_TOPIC = 'topic1';
const FIRST_ORIENT = 'like';
const SECOND_TOPIC = 'topic2';
const SECOND_ORIENT = 'dislike';
const TAG_CREATE_DTOS = [
  new TagCreateDTO(FIRST_TOPIC, FIRST_ORIENT),
  new TagCreateDTO(SECOND_TOPIC, SECOND_ORIENT),
];
const JOURNEY_CREATE_DTO = new JourneyCreateDTO(
  JOURNEY_NAME,
  START_DATE,
  END_DATE,
  THEME_PATH,
  TAG_CREATE_DTOS,
);
const USER_ID = 'kakao-1234';
const USER = new User();
USER._id = USER_ID;
const TAGS = [
  new Tag(FIRST_TOPIC, FIRST_ORIENT, [USER]),
  new Tag(SECOND_TOPIC, SECOND_ORIENT, [USER]),
];
const JOURNEY = new Journey(
  JOURNEY_NAME,
  START_DATE,
  END_DATE,
  THEME_PATH,
  [USER],
  TAGS,
  [],
  [[], [], []],
) as JourneyDocument;
const SAVED_JOURNEY = structuredClone(JOURNEY);
const JOURNEY_ID = '630b28c08abfc3f96130789c';
SAVED_JOURNEY._id = new mongoose.Types.ObjectId(JOURNEY_ID);
const ID_RESPONSE_DTO = new IdResponseDTO(JOURNEY_ID);

describe('JourneyService', () => {
  let journeyService: JourneyService;
  let journeyRepository: JourneyRepository;
  let userRepository: UserRepository;
  const journeyModel = jest.fn().mockReturnValue(JOURNEY);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyService,
        UserRepository,
        {
          provide: JourneyRepository,
          useValue: {},
        },
        {
          provide: UserRepository,
          useValue: {},
        },
        {
          provide: getModelToken(Journey.name),
          useValue: journeyModel,
        },
      ],
    }).compile();

    journeyService = module.get<JourneyService>(JourneyService);
    journeyRepository = module.get<JourneyRepository>(JourneyRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    journeyModel.mockClear();
  });

  it('should be defined', () => {
    expect(journeyService).toBeDefined();
  });

  it('createJourney는 JourneyDocument 인스턴스를 생성해서 JourneyRepository.insertOne을 호출한다.', async () => {
    // given
    userRepository.findOne = jest.fn().mockResolvedValue(USER);
    journeyModel.constructor = jest.fn().mockReturnValue(JOURNEY);
    journeyRepository.listByUser = jest.fn().mockResolvedValue([[]]);
    journeyRepository.insertOne = jest.fn().mockResolvedValue(SAVED_JOURNEY);

    // when
    const result = await journeyService.createJourney(
      JOURNEY_CREATE_DTO,
      USER_ID,
    );

    // then
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith(USER_ID);
    expect(journeyRepository.listByUser).toBeCalledTimes(1);
    expect(journeyRepository.listByUser).toBeCalledWith(USER, false);
    expect(journeyModel).toBeCalledTimes(1);
    expect(journeyModel).toBeCalledWith({
      name: JOURNEY_NAME,
      start: START_DATE,
      end: END_DATE,
      theme: THEME_PATH,
      users: [USER],
      tags: TAGS,
      pikmis: [],
      pikis: [[], [], []],
    });
    expect(journeyRepository.insertOne).toBeCalledTimes(1);
    expect(journeyRepository.insertOne).toBeCalledWith(JOURNEY);
    expect(result).toEqual(ID_RESPONSE_DTO);
  });

  it('createJourney는 유저가 이미 만든 journey가 MAX_JOURNEY_PER_USER를 초과할 경우 LimitExceededException을 throw한다.', async () => {
    // given
    const existingJourneys = [];
    for (const i of Array(MAX_JOURNEY_PER_USER).keys()) {
      existingJourneys.push([]);
    }
    userRepository.findOne = jest.fn().mockResolvedValue(USER);
    journeyRepository.listByUser = jest
      .fn()
      .mockResolvedValue(existingJourneys);
    journeyModel.constructor = jest.fn().mockReturnValue(JOURNEY);
    journeyRepository.insertOne = jest.fn().mockResolvedValue(SAVED_JOURNEY);

    // then
    await expect(
      journeyService.createJourney(JOURNEY_CREATE_DTO, USER_ID),
    ).rejects.toThrow(new LimitExceededException(JOURNEY_EXCEEDED_MSG));
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith(USER_ID);
    expect(journeyRepository.listByUser).toBeCalledTimes(1);
    expect(journeyRepository.listByUser).toBeCalledWith(USER, false);
  });
});

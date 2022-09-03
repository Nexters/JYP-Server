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
  PikmiCreateDTO,
  TagCreateDTO,
} from './dtos/journey.dto';
import { User } from '../user/schemas/user.schema';
import {
  InvalidJwtPayloadException,
  JourneyNotExistException,
  LimitExceededException,
} from '../common/exceptions';
import {
  INVALID_ID_IN_JWT_MSG,
  JOURNEY_EXCEEDED_MSG,
  JOURNEY_NOT_EXIST_MSG,
  PIKMI_EXCEEDED_MSG,
} from '../common/validation/validation.messages';
import {
  MAX_JOURNEY_PER_USER,
  MAX_PIKMI_PER_JOURNEY,
} from '../common/validation/validation.constants';

jest.mock('../common/validation/validation.constants', () => ({
  MAX_JOURNEY_PER_USER: 5,
  MAX_PIKMI_PER_JOURNEY: 5,
}));

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
const USER_NAME = 'username';
const USER_IMG = '/user/img';
const USER_PSN_ID = 'ME';
const USER = new User(USER_ID, USER_NAME, USER_IMG, USER_PSN_ID);
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
const JOURNEY_ID_RESPONSE_DTO = new IdResponseDTO(JOURNEY_ID);
const PIKMI_NAME = 'pikmi';
const PIKMI_ADDR = 'pikmi addr';
const PIKMI_CATEGORY = 'P';
const PIKMI_LON = 129.4;
const PIKMI_LAT = 36.7;
const PIKMI_LINK = '/pikmi/link';
const PIKMI_CREATE_DTO = new PikmiCreateDTO(
  PIKMI_NAME,
  PIKMI_ADDR,
  PIKMI_CATEGORY,
  PIKMI_LON,
  PIKMI_LAT,
  PIKMI_LINK,
);

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

  describe('createJourney', () => {
    it('JourneyDocument 인스턴스를 생성해서 JourneyRepository.insertOne을 호출한다.', async () => {
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
      expect(journeyModel).toBeCalledWith(JOURNEY);
      expect(journeyRepository.insertOne).toBeCalledTimes(1);
      expect(journeyRepository.insertOne).toBeCalledWith(JOURNEY);
      expect(result).toEqual(JOURNEY_ID_RESPONSE_DTO);
    });

    it('유저가 이미 만든 journey가 MAX_JOURNEY_PER_USER를 초과할 경우 LimitExceededException을 throw한다.', async () => {
      // given
      const existingJourneys = [];
      for (const _ of Array(MAX_JOURNEY_PER_USER).keys()) {
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

    it('userId에 해당하는 user가 없을 경우 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      const existingJourneys = [];
      for (const _ of Array(MAX_JOURNEY_PER_USER).keys()) {
        existingJourneys.push([]);
      }
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      journeyRepository.listByUser = jest
        .fn()
        .mockResolvedValue(existingJourneys);
      journeyModel.constructor = jest.fn().mockReturnValue(JOURNEY);
      journeyRepository.insertOne = jest.fn().mockResolvedValue(SAVED_JOURNEY);

      // then
      await expect(
        journeyService.createJourney(JOURNEY_CREATE_DTO, USER_ID),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
    });
  });

  describe('createPikmi', () => {
    it('Pikmi 인스턴스를 생성해서 journey에 넣고 journeyRepository.update를 호출한다.', async () => {
      // given
      const journeyForUpdate = structuredClone(JOURNEY);
      journeyRepository.get = jest.fn().mockResolvedValue(journeyForUpdate);
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.updateOne = jest.fn();

      // when
      const result = await journeyService.createPikmi(
        PIKMI_CREATE_DTO,
        JOURNEY_ID,
        USER_ID,
      );

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.updateOne).toBeCalledTimes(1);
      expect(journeyRepository.updateOne).toBeCalledWith(journeyForUpdate);
      expect(JOURNEY.pikmis.length + 1).toBe(journeyForUpdate.pikmis.length);
      const pikmiWithId =
        journeyForUpdate.pikmis[journeyForUpdate.pikmis.length - 1];
      expect(pikmiWithId.name).toBe(PIKMI_NAME);
      expect(pikmiWithId.addr).toBe(PIKMI_ADDR);
      expect(pikmiWithId.cate).toBe(PIKMI_CATEGORY);
      expect(pikmiWithId.likeBy).toEqual([USER]);
      expect(pikmiWithId.lon).toBe(PIKMI_LON);
      expect(pikmiWithId.lat).toBe(PIKMI_LAT);
      expect(pikmiWithId.link).toBe(PIKMI_LINK);
      const expectedResponse = new IdResponseDTO(pikmiWithId._id.toString());
      expect(result).toEqual(expectedResponse);
    });

    it('해당하는 유저가 없으면 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      const journeyForUpdate = structuredClone(JOURNEY);
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      journeyRepository.get = jest.fn().mockResolvedValue(journeyForUpdate);
      journeyRepository.updateOne = jest.fn();

      // then
      await expect(
        journeyService.createPikmi(PIKMI_CREATE_DTO, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.updateOne).toBeCalledTimes(0);
    });

    it('해당하는 저니가 없으면 JourneyNotExistException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.get = jest.fn().mockResolvedValue(null);
      journeyRepository.updateOne = jest.fn();

      // then
      await expect(
        journeyService.createPikmi(PIKMI_CREATE_DTO, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.updateOne).toBeCalledTimes(0);
    });

    it('저니에 픽미 갯수가 MAX_PIKMI_PER_JOURNEY를 초과할 경우 LimitExceededException을 throw한다.', async () => {
      // given
      const journeyForUpdate = structuredClone(JOURNEY);
      for (const _ of Array(MAX_PIKMI_PER_JOURNEY).keys()) {
        journeyForUpdate.pikmis.push({});
      }
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.get = jest.fn().mockResolvedValue(journeyForUpdate);
      journeyRepository.updateOne = jest.fn();

      // then
      await expect(
        journeyService.createPikmi(PIKMI_CREATE_DTO, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new LimitExceededException(PIKMI_EXCEEDED_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.updateOne).toBeCalledTimes(0);
    });
  });
});

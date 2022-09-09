import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { UserRepository } from '../user/user.repository';
import { JourneyRepository } from './journey.repository';
import { JourneyService } from './journey.service';
import { Journey, JourneyDocument, Pikmi, Tag } from './schemas/journey.schema';
import {
  IdResponseDTO,
  JourneyCreateDTO,
  PikisUpdateDTO,
  PikiUpdateDTO,
  PikmiCreateDTO,
  TagCreateDTO,
  TagsUpdateDTO,
} from './dtos/journey.dto';
import { User } from '../user/schemas/user.schema';
import {
  IndexOutOfRangeException,
  InvalidJwtPayloadException,
  JourneyNotExistException,
  LimitExceededException,
  PikmiNotExistException,
  UnauthenticatedException,
} from '../common/exceptions';
import {
  INDEX_OUT_OF_RANGE_MSG,
  INVALID_ID_IN_JWT_MSG,
  JOURNEY_EXCEEDED_MSG,
  JOURNEY_NOT_EXIST_MSG,
  PIKMI_EXCEEDED_MSG,
  PIKMI_NOT_EXIST_MSG,
  USER_EXCEEDED_MSG,
  USER_NOT_IN_JOURNEY_MSG,
} from '../common/validation/validation.messages';
import {
  MAX_JOURNEY_PER_USER,
  MAX_PIKMI_PER_JOURNEY,
} from '../common/validation/validation.constants';

jest.mock('../common/validation/validation.constants', () => ({
  MAX_JOURNEY_PER_USER: 5,
  MAX_PIKMI_PER_JOURNEY: 5,
  MAX_USER_PER_JOURNEY: 2,
}));

const JOURNEY_NAME = 'name';
const START_DATE = 1661299200;
const END_DATE = 1661558400; // 3일 차이
const THEME_PATH = 'path';
const FIRST_TOPIC = 'topic1';
const FIRST_ORIENT = 'like';
const SECOND_TOPIC = 'topic2';
const SECOND_ORIENT = 'dislike';
const THIRD_TOPIC = 'topic3';
const THIRD_ORIENT = 'nomatter';
const FOURTH_TOPIC = 'topic4';
const FOURTH_ORIENT = 'like';
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
  new Tag(FIRST_TOPIC, FIRST_ORIENT, USER),
  new Tag(SECOND_TOPIC, SECOND_ORIENT, USER),
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
const PIKMI1_ID = '63136a1e02efbf949b847f8e';
const PIKMI2_ID = '63136a1e02efbf949b847f8f';
const PIKMI3_ID = '63136a1e02efbf949b847f90';
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
const PIKI_INDEX = 0;
const PIKI1_ID = '63136a1e02efbf949b847f8c';
const PIKI1_NAME = 'piki1';
const PIKI1_ADDR = 'piki1 addr';
const PIKI1_CATEGORY = 'T';
const PIKI1_LON = 130.4;
const PIKI1_LAT = 37.7;
const PIKI1_LINK = '/piki2/link';
const PIKI2_ID = '63136a1e02efbf949b847f8d';
const PIKI2_NAME = 'piki2';
const PIKI2_ADDR = 'piki2 addr';
const PIKI2_CATEGORY = 'S';
const PIKI2_LON = 131.4;
const PIKI2_LAT = 38.7;
const PIKI2_LINK = '/piki2/link';
const PIKI_UPDATE_DTOS_NO_ID = [
  new PikiUpdateDTO(
    undefined,
    PIKI1_NAME,
    PIKI1_ADDR,
    PIKI1_CATEGORY,
    PIKI1_LON,
    PIKI1_LAT,
    PIKI1_LINK,
  ),
  new PikiUpdateDTO(
    undefined,
    PIKI2_NAME,
    PIKI2_ADDR,
    PIKI2_CATEGORY,
    PIKI2_LON,
    PIKI2_LAT,
    PIKI2_LINK,
  ),
];
const PIKI_UPDATE_DTOS_WITH_ID = [
  new PikiUpdateDTO(
    PIKI1_ID,
    PIKI1_NAME,
    PIKI1_ADDR,
    PIKI1_CATEGORY,
    PIKI1_LON,
    PIKI1_LAT,
    PIKI1_LINK,
  ),
  new PikiUpdateDTO(
    PIKI2_ID,
    PIKI2_NAME,
    PIKI2_ADDR,
    PIKI2_CATEGORY,
    PIKI2_LON,
    PIKI2_LAT,
    PIKI2_LINK,
  ),
];
const PIKIS_UPDATE_DTO_NO_ID = new PikisUpdateDTO(
  PIKI_INDEX,
  PIKI_UPDATE_DTOS_NO_ID,
);
const PIKIS_UPDATE_DTO_WITH_ID = new PikisUpdateDTO(
  PIKI_INDEX,
  PIKI_UPDATE_DTOS_WITH_ID,
);
const USER2 = new User('user2', 'name2', 'img2', 'ME');
const USER3 = new User('user3', 'name3', 'img3', 'ME');

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
    beforeEach(async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyModel.constructor = jest.fn().mockReturnValue(JOURNEY);
      journeyRepository.listByUser = jest.fn().mockResolvedValue([[]]);
      journeyRepository.insert = jest.fn().mockResolvedValue(SAVED_JOURNEY);
    });

    it('JourneyDocument 인스턴스를 생성해서 JourneyRepository.insert를 호출한다.', async () => {
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
      expect(journeyRepository.insert).toBeCalledTimes(1);
      expect(journeyRepository.insert).toBeCalledWith(JOURNEY);
      expect(result).toEqual(JOURNEY_ID_RESPONSE_DTO);
    });

    it('유저가 이미 만든 journey가 MAX_JOURNEY_PER_USER를 초과할 경우 LimitExceededException을 throw한다.', async () => {
      // given
      const existingJourneys = [];
      for (const _ of Array(MAX_JOURNEY_PER_USER).keys()) {
        existingJourneys.push([]);
      }
      journeyRepository.listByUser = jest
        .fn()
        .mockResolvedValue(existingJourneys);

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
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.createJourney(JOURNEY_CREATE_DTO, USER_ID),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
    });
  });

  describe('createPikmi', () => {
    let journey: JourneyDocument;

    beforeEach(async () => {
      // given
      journey = structuredClone(JOURNEY);
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.update = jest.fn();
    });

    it('Pikmi 인스턴스를 생성해서 journey에 넣고 journeyRepository.update를 호출한다.', async () => {
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
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journey);
      expect(JOURNEY.pikmis.length + 1).toBe(journey.pikmis.length);
      const pikmiWithId = journey.pikmis[journey.pikmis.length - 1];
      expect(pikmiWithId.name).toBe(PIKMI_NAME);
      expect(pikmiWithId.addr).toBe(PIKMI_ADDR);
      expect(pikmiWithId.cate).toBe(PIKMI_CATEGORY);
      expect(pikmiWithId.likeBy).toEqual([]);
      expect(pikmiWithId.lon).toBe(PIKMI_LON);
      expect(pikmiWithId.lat).toBe(PIKMI_LAT);
      expect(pikmiWithId.link).toBe(PIKMI_LINK);
      const expectedResponse = new IdResponseDTO(pikmiWithId._id.toString());
      expect(result).toEqual(expectedResponse);
    });

    it('해당하는 유저가 없으면 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.createPikmi(PIKMI_CREATE_DTO, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('해당하는 저니가 없으면 JourneyNotExistException을 throw한다.', async () => {
      // given
      journeyRepository.get = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.createPikmi(PIKMI_CREATE_DTO, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('저니에 유저가 소속되어 있지 않으면 UnauthenticatedException을 throw한다.', async () => {
      // given
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);

      // then
      await expect(
        journeyService.createPikmi(PIKMI_CREATE_DTO, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('저니에 픽미 갯수가 MAX_PIKMI_PER_JOURNEY를 초과할 경우 LimitExceededException을 throw한다.', async () => {
      // given
      journey = structuredClone(JOURNEY);
      const pikmi = new Pikmi(
        PIKMI1_ID,
        PIKMI_NAME,
        PIKI1_ADDR,
        PIKI1_CATEGORY,
        [],
        PIKMI_LON,
        PIKMI_LAT,
        PIKMI_LINK,
      );
      for (const _ of Array(MAX_PIKMI_PER_JOURNEY).keys()) {
        journey.pikmis.push(pikmi);
      }
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.update = jest.fn();

      // then
      await expect(
        journeyService.createPikmi(PIKMI_CREATE_DTO, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new LimitExceededException(PIKMI_EXCEEDED_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });
  });

  describe('updatePiki', () => {
    let journey: JourneyDocument;

    beforeEach(async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journey = structuredClone(JOURNEY);
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.update = jest.fn();
    });

    it('piki에 id가 없을 경우 직접 생성해서 journey의 올바른 인덱스에 넣고 journeyRepository.update를 호출한다.', async () => {
      // when
      const result = await journeyService.updatePiki(
        PIKIS_UPDATE_DTO_NO_ID,
        JOURNEY_ID,
        USER_ID,
      );

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journey);
      const pikis = journey.pikis[PIKI_INDEX];
      const piki1 = pikis[0];
      expect(piki1._id.toString()).toBe(result.ids[0]);
      expect(piki1.name).toBe(PIKI1_NAME);
      expect(piki1.addr).toBe(PIKI1_ADDR);
      expect(piki1.cate).toBe(PIKI1_CATEGORY);
      expect(piki1.lon).toBe(PIKI1_LON);
      expect(piki1.lat).toBe(PIKI1_LAT);
      expect(piki1.link).toBe(PIKI1_LINK);
      const piki2 = pikis[1];
      expect(piki2._id.toString()).toBe(result.ids[1]);
      expect(piki2.name).toBe(PIKI2_NAME);
      expect(piki2.addr).toBe(PIKI2_ADDR);
      expect(piki2.cate).toBe(PIKI2_CATEGORY);
      expect(piki2.lon).toBe(PIKI2_LON);
      expect(piki2.lat).toBe(PIKI2_LAT);
      expect(piki2.link).toBe(PIKI2_LINK);
    });

    it('piki에 id가 존재할 경우 그대로 사용해서 journey의 올바른 인덱스에 넣고 journeyRepository.update를 호출한다.', async () => {
      // when
      const result = await journeyService.updatePiki(
        PIKIS_UPDATE_DTO_WITH_ID,
        JOURNEY_ID,
        USER_ID,
      );

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journey);
      const pikis = journey.pikis[PIKI_INDEX];
      const piki1 = pikis[0];
      expect(piki1._id.toString()).toBe(result.ids[0]);
      expect(piki1._id.toString()).toBe(PIKI1_ID);
      expect(piki1.name).toBe(PIKI1_NAME);
      expect(piki1.addr).toBe(PIKI1_ADDR);
      expect(piki1.cate).toBe(PIKI1_CATEGORY);
      expect(piki1.lon).toBe(PIKI1_LON);
      expect(piki1.lat).toBe(PIKI1_LAT);
      expect(piki1.link).toBe(PIKI1_LINK);
      const piki2 = pikis[1];
      expect(piki2._id.toString()).toBe(result.ids[1]);
      expect(piki2._id.toString()).toBe(PIKI2_ID);
      expect(piki2.name).toBe(PIKI2_NAME);
      expect(piki2.addr).toBe(PIKI2_ADDR);
      expect(piki2.cate).toBe(PIKI2_CATEGORY);
      expect(piki2.lon).toBe(PIKI2_LON);
      expect(piki2.lat).toBe(PIKI2_LAT);
      expect(piki2.link).toBe(PIKI2_LINK);
    });

    it('해당하는 유저가 없으면 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.updatePiki(PIKIS_UPDATE_DTO_NO_ID, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('해당하는 저니가 없으면 JourneyNotExistException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.get = jest.fn().mockResolvedValue(null);
      journeyRepository.update = jest.fn();

      // then
      await expect(
        journeyService.updatePiki(PIKIS_UPDATE_DTO_NO_ID, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('저니에 유저가 소속되어 있지 않으면 UnauthenticatedException을 throw한다.', async () => {
      // given
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);

      // then
      await expect(
        journeyService.updatePiki(PIKIS_UPDATE_DTO_NO_ID, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('index가 범위를 초과하면 IndexOutOfRangeException을 throw한다.', async () => {
      // given
      const invalidIndex = JOURNEY.pikis.length;
      const pikisUpdateDtoWithInvalidIndex = new PikisUpdateDTO(
        invalidIndex,
        PIKI_UPDATE_DTOS_NO_ID,
      );

      // then
      await expect(
        journeyService.updatePiki(
          pikisUpdateDtoWithInvalidIndex,
          JOURNEY_ID,
          USER_ID,
        ),
      ).rejects.toThrow(new IndexOutOfRangeException(INDEX_OUT_OF_RANGE_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });
  });

  describe('updateTags', () => {
    let journey: JourneyDocument;
    let tagDeletedJourney: JourneyDocument;
    let tagsUpdateDto: TagsUpdateDTO;

    beforeEach(async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      const tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER2),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER3),
      ];
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2, USER3],
        tags,
        [],
        [[], [], []],
      ) as JourneyDocument;
      tagDeletedJourney = structuredClone(journey);
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.deleteTags = jest
        .fn()
        .mockResolvedValue(tagDeletedJourney);
      journeyRepository.update = jest.fn();
      tagsUpdateDto = new TagsUpdateDTO([
        new TagCreateDTO(FIRST_TOPIC, FIRST_ORIENT),
        new TagCreateDTO(THIRD_TOPIC, THIRD_ORIENT),
        new TagCreateDTO(FOURTH_TOPIC, FOURTH_ORIENT),
      ]);
    });

    it('태그를 추가한다.', async () => {
      // when
      await journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.deleteTags).toBeCalledTimes(1);
      expect(journeyRepository.deleteTags).toBeCalledWith(JOURNEY_ID, USER_ID);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(tagDeletedJourney);
      const expectedTags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER2),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER3),
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER),
        new Tag(THIRD_TOPIC, THIRD_ORIENT, USER),
        new Tag(FOURTH_TOPIC, FOURTH_ORIENT, USER),
      ];
      const updatedTags = tagDeletedJourney.tags;
      expect(updatedTags).toEqual(expectedTags);
    });

    it('userId에 해당하는 user가 없을 경우 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('해당하는 저니가 없으면 JourneyNotExistException을 throw한다.', async () => {
      // given
      journeyRepository.get = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('저니에 유저가 소속되어 있지 않으면 UnauthenticatedException을 throw한다.', async () => {
      // given
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);

      // then
      await expect(
        journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });
  });

  describe('addUserToJourney', () => {
    let journey: JourneyDocument;

    beforeEach(async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER2);
      journey = structuredClone(JOURNEY);
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.update = jest.fn().mockResolvedValue(journey);
    });

    it('저니에 유저를 추가해 저장한다.', async () => {
      // when
      const result = await journeyService.addUserToJourney(
        JOURNEY_ID,
        USER2._id,
      );

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER2._id);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journey);
      expect(result.users).toEqual([USER, USER2]);
    });

    it('userId에 해당하는 user가 없을 경우 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.addUserToJourney(JOURNEY_ID, USER2._id),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER2._id);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('해당하는 저니가 없으면 JourneyNotExistException을 throw한다.', async () => {
      // given
      journeyRepository.get = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.addUserToJourney(JOURNEY_ID, USER2._id),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('저니에 정원이 찼을 경우 LimitExceededException을 throw한다.', async () => {
      // given
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER3],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.update = jest.fn().mockResolvedValue(journey);

      // then
      await expect(
        journeyService.addUserToJourney(JOURNEY_ID, USER2._id),
      ).rejects.toThrow(new LimitExceededException(USER_EXCEEDED_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });
  });

  describe('deleteUserFromJourney', () => {
    let journey: JourneyDocument;
    let userDeletedJourney: JourneyDocument;

    beforeEach(async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      userDeletedJourney = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.deleteTags = jest.fn();
      journeyRepository.deleteAllPikmiLikeBy = jest.fn();
      journeyRepository.deleteUser = jest
        .fn()
        .mockResolvedValue(userDeletedJourney);
      journeyRepository.delete = jest.fn();
    });

    it('저니에서 유저 및 유저가 추가한 태그와 픽미 좋아요를 삭제한다. 저니에 유저가 남아있다면 저니는 삭제하지 않는다.', async () => {
      // when
      await journeyService.deleteUserFromJourney(JOURNEY_ID, USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.deleteTags).toBeCalledTimes(1);
      expect(journeyRepository.deleteTags).toBeCalledWith(JOURNEY_ID, USER_ID);
      expect(journeyRepository.deleteAllPikmiLikeBy).toBeCalledTimes(1);
      expect(journeyRepository.deleteAllPikmiLikeBy).toBeCalledWith(
        JOURNEY_ID,
        USER_ID,
      );
      expect(journeyRepository.deleteUser).toBeCalledTimes(1);
      expect(journeyRepository.deleteUser).toBeCalledWith(JOURNEY_ID, USER_ID);
      expect(journeyRepository.delete).toBeCalledTimes(0);
    });

    it('저니에서 유저 및 유저가 추가한 태그와 픽미 좋아요를 삭제한다. 저니에 유저가 남아있지 않으면 저니를 삭제한다.', async () => {
      // given
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      userDeletedJourney = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.deleteUser = jest
        .fn()
        .mockResolvedValue(userDeletedJourney);

      // when
      await journeyService.deleteUserFromJourney(JOURNEY_ID, USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.deleteTags).toBeCalledTimes(1);
      expect(journeyRepository.deleteTags).toBeCalledWith(JOURNEY_ID, USER_ID);
      expect(journeyRepository.deleteAllPikmiLikeBy).toBeCalledTimes(1);
      expect(journeyRepository.deleteAllPikmiLikeBy).toBeCalledWith(
        JOURNEY_ID,
        USER_ID,
      );
      expect(journeyRepository.deleteUser).toBeCalledTimes(1);
      expect(journeyRepository.deleteUser).toBeCalledWith(JOURNEY_ID, USER_ID);
      expect(journeyRepository.delete).toBeCalledTimes(1);
      expect(journeyRepository.delete).toBeCalledWith(userDeletedJourney);
    });

    it('userId에 해당하는 user가 없을 경우 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.deleteUserFromJourney(JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.deleteTags).toBeCalledTimes(0);
      expect(journeyRepository.deleteAllPikmiLikeBy).toBeCalledTimes(0);
      expect(journeyRepository.deleteUser).toBeCalledTimes(0);
      expect(journeyRepository.delete).toBeCalledTimes(0);
    });

    it('해당하는 저니가 없으면 JourneyNotExistException을 throw한다.', async () => {
      // given
      journeyRepository.get = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.deleteUserFromJourney(JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.deleteTags).toBeCalledTimes(0);
      expect(journeyRepository.deleteAllPikmiLikeBy).toBeCalledTimes(0);
      expect(journeyRepository.deleteUser).toBeCalledTimes(0);
      expect(journeyRepository.delete).toBeCalledTimes(0);
    });

    it('저니에 유저가 소속되어 있지 않으면 UnauthenticatedException을 throw한다.', async () => {
      // given
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);

      // then
      await expect(
        journeyService.deleteUserFromJourney(JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.deleteTags).toBeCalledTimes(0);
      expect(journeyRepository.deleteAllPikmiLikeBy).toBeCalledTimes(0);
      expect(journeyRepository.deleteUser).toBeCalledTimes(0);
      expect(journeyRepository.delete).toBeCalledTimes(0);
    });
  });

  describe('addLikesToPikmi', () => {
    let pikmi1: Pikmi;
    let pikmi2: Pikmi;
    let pikmi3: Pikmi;
    let journey: JourneyDocument;

    beforeEach(async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      pikmi1 = new Pikmi(
        PIKMI1_ID,
        PIKMI_NAME,
        PIKMI_ADDR,
        PIKMI_CATEGORY,
        [USER2],
        PIKMI_LON,
        PIKMI_LAT,
        PIKMI_LINK,
      );
      pikmi2 = new Pikmi(
        PIKMI2_ID,
        PIKMI_NAME,
        PIKMI_ADDR,
        PIKMI_CATEGORY,
        [USER2],
        PIKMI_LON,
        PIKMI_LAT,
        PIKMI_LINK,
      );
      pikmi3 = new Pikmi(
        PIKMI3_ID,
        PIKMI_NAME,
        PIKMI_ADDR,
        PIKMI_CATEGORY,
        [USER],
        PIKMI_LON,
        PIKMI_LAT,
        PIKMI_LINK,
      );
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2],
        TAGS,
        [pikmi1, pikmi2, pikmi3],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.addLikeBy = jest.fn();
    });

    it('픽미에 유저의 좋아요가 없을 경우 추가한다.', async () => {
      // when
      await journeyService.addLikesToPikmi(JOURNEY_ID, PIKMI1_ID, USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.addLikeBy).toBeCalledTimes(1);
      expect(journeyRepository.addLikeBy).toBeCalledWith(
        JOURNEY_ID,
        PIKMI1_ID,
        USER_ID,
      );
    });

    it('픽미에 유저의 좋아요가 있을 경우 추가하지 않는다.', async () => {
      // given
      pikmi1 = new Pikmi(
        PIKMI1_ID,
        PIKMI_NAME,
        PIKMI_ADDR,
        PIKMI_CATEGORY,
        [USER, USER2],
        PIKMI_LON,
        PIKMI_LAT,
        PIKMI_LINK,
      );
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2],
        TAGS,
        [pikmi1, pikmi2, pikmi3],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);

      // when
      await journeyService.addLikesToPikmi(JOURNEY_ID, PIKMI1_ID, USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.addLikeBy).toBeCalledTimes(0);
    });

    it('userId에 해당하는 user가 없을 경우 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.addLikesToPikmi(JOURNEY_ID, PIKMI1_ID, USER_ID),
      ).rejects.toThrow(new InvalidJwtPayloadException(INVALID_ID_IN_JWT_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.addLikeBy).toBeCalledTimes(0);
    });

    it('해당하는 저니가 없으면 JourneyNotExistException을 throw한다.', async () => {
      // given
      journeyRepository.get = jest.fn().mockResolvedValue(null);

      // then
      await expect(
        journeyService.addLikesToPikmi(JOURNEY_ID, PIKMI1_ID, USER_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.addLikeBy).toBeCalledTimes(0);
    });

    it('저니에 유저가 소속되어 있지 않으면 UnauthenticatedException을 throw한다.', async () => {
      // given
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [pikmi1, pikmi2, pikmi3],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);

      // then
      await expect(
        journeyService.addLikesToPikmi(JOURNEY_ID, PIKMI1_ID, USER_ID),
      ).rejects.toThrow(new UnauthenticatedException(USER_NOT_IN_JOURNEY_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.addLikeBy).toBeCalledTimes(0);
    });

    it('해당하는 픽미가 없으면 PikmiNotExistException을 throw한다.', async () => {
      // given
      journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2],
        TAGS,
        [pikmi2, pikmi3],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);

      // then
      await expect(
        journeyService.addLikesToPikmi(JOURNEY_ID, PIKMI1_ID, USER_ID),
      ).rejects.toThrow(new PikmiNotExistException(PIKMI_NOT_EXIST_MSG));
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.addLikeBy).toBeCalledTimes(0);
    });
  });
});

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
} from '../common/exceptions';
import {
  INDEX_OUT_OF_RANGE_MSG,
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
    it('JourneyDocument 인스턴스를 생성해서 JourneyRepository.insert를 호출한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyModel.constructor = jest.fn().mockReturnValue(JOURNEY);
      journeyRepository.listByUser = jest.fn().mockResolvedValue([[]]);
      journeyRepository.insert = jest.fn().mockResolvedValue(SAVED_JOURNEY);

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
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.listByUser = jest
        .fn()
        .mockResolvedValue(existingJourneys);
      journeyModel.constructor = jest.fn().mockReturnValue(JOURNEY);
      journeyRepository.insert = jest.fn().mockResolvedValue(SAVED_JOURNEY);

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
      journeyRepository.insert = jest.fn().mockResolvedValue(SAVED_JOURNEY);

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
      journeyRepository.update = jest.fn();

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
      expect(journeyRepository.update).toBeCalledWith(journeyForUpdate);
      expect(JOURNEY.pikmis.length + 1).toBe(journeyForUpdate.pikmis.length);
      const pikmiWithId =
        journeyForUpdate.pikmis[journeyForUpdate.pikmis.length - 1];
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
      const journeyForUpdate = structuredClone(JOURNEY);
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      journeyRepository.get = jest.fn().mockResolvedValue(journeyForUpdate);
      journeyRepository.update = jest.fn();

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
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.get = jest.fn().mockResolvedValue(null);
      journeyRepository.update = jest.fn();

      // then
      await expect(
        journeyService.createPikmi(PIKMI_CREATE_DTO, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('저니에 픽미 갯수가 MAX_PIKMI_PER_JOURNEY를 초과할 경우 LimitExceededException을 throw한다.', async () => {
      // given
      const journeyForUpdate = structuredClone(JOURNEY);
      for (const _ of Array(MAX_PIKMI_PER_JOURNEY).keys()) {
        journeyForUpdate.pikmis.push({});
      }
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      journeyRepository.get = jest.fn().mockResolvedValue(journeyForUpdate);
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
    it('piki에 id가 없을 경우 직접 생성해서 journey의 올바른 인덱스에 넣고 journeyRepository.update를 호출한다.', async () => {
      // given
      const journeyForUpdate = structuredClone(JOURNEY);
      journeyRepository.get = jest.fn().mockResolvedValue(journeyForUpdate);
      journeyRepository.update = jest.fn();

      // when
      const result = await journeyService.updatePiki(
        PIKIS_UPDATE_DTO_NO_ID,
        JOURNEY_ID,
      );

      // then
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journeyForUpdate);
      const pikis = journeyForUpdate.pikis[PIKI_INDEX];
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
      // given
      const journeyForUpdate = structuredClone(JOURNEY);
      journeyRepository.get = jest.fn().mockResolvedValue(journeyForUpdate);
      journeyRepository.update = jest.fn();

      // when
      const result = await journeyService.updatePiki(
        PIKIS_UPDATE_DTO_WITH_ID,
        JOURNEY_ID,
      );

      // then
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journeyForUpdate);
      const pikis = journeyForUpdate.pikis[PIKI_INDEX];
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

    it('해당하는 저니가 없으면 JourneyNotExistException을 throw한다.', async () => {
      // given
      journeyRepository.get = jest.fn().mockResolvedValue(null);
      journeyRepository.update = jest.fn();

      // then
      await expect(
        journeyService.updatePiki(PIKIS_UPDATE_DTO_NO_ID, JOURNEY_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });

    it('index가 범위를 초과하면 IndexOutOfRangeException을 throw한다.', async () => {
      // given
      const journeyForUpdate = structuredClone(JOURNEY);
      journeyRepository.get = jest.fn().mockResolvedValue(journeyForUpdate);
      journeyRepository.update = jest.fn();
      const invalidIndex = JOURNEY.pikis.length;
      const pikisUpdateDtoWithInvalidIndex = new PikisUpdateDTO(
        invalidIndex,
        PIKI_UPDATE_DTOS_NO_ID,
      );

      // then
      await expect(
        journeyService.updatePiki(pikisUpdateDtoWithInvalidIndex, JOURNEY_ID),
      ).rejects.toThrow(new IndexOutOfRangeException(INDEX_OUT_OF_RANGE_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });
  });

  describe('updateTags', () => {
    it('기존에 유저의 태그가 존재하지 않을 때 태그를 추가한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      const tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, [USER2, USER3]),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, [USER2]),
        new Tag(THIRD_TOPIC, THIRD_ORIENT, [USER3]),
      ];
      const journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2, USER3],
        tags,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.update = jest.fn();

      // when
      const tagsUpdateDto = new TagsUpdateDTO([
        new TagCreateDTO(FIRST_TOPIC, FIRST_ORIENT),
        new TagCreateDTO(SECOND_TOPIC, SECOND_ORIENT),
        new TagCreateDTO(FOURTH_TOPIC, FOURTH_ORIENT),
      ]);
      await journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journey);
      const updatedTags = journey.tags;
      expect(updatedTags.length).toBe(4);
      expect(updatedTags[0].users).toEqual([USER2, USER3, USER]);
      expect(updatedTags[1].users).toEqual([USER2, USER]);
      expect(updatedTags[2].users).toEqual([USER3]);
      expect(updatedTags[3].users).toEqual([USER]);
    });

    it('기존에 유저의 태그가 존재할 때 기존 태그를 삭제하고 태그를 추가한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      const tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, [USER2, USER3]),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, [USER, USER2]),
        new Tag(THIRD_TOPIC, THIRD_ORIENT, [USER, USER3]),
      ];
      const journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2, USER3],
        tags,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.update = jest.fn();

      // when
      const tagsUpdateDto = new TagsUpdateDTO([
        new TagCreateDTO(FIRST_TOPIC, FIRST_ORIENT),
        new TagCreateDTO(SECOND_TOPIC, SECOND_ORIENT),
        new TagCreateDTO(FOURTH_TOPIC, FOURTH_ORIENT),
      ]);
      await journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journey);
      const updatedTags = journey.tags;
      expect(updatedTags.length).toBe(4);
      expect(updatedTags[0].users).toEqual([USER2, USER3, USER]);
      expect(updatedTags[1].users).toEqual([USER, USER2]);
      expect(updatedTags[2].users).toEqual([USER3]);
      expect(updatedTags[3].users).toEqual([USER]);
    });

    it('태그 업데이트 후 유저가 존재하지 않는 태그는 삭제된다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      const tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, [USER2, USER3]),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, [USER]),
        new Tag(THIRD_TOPIC, THIRD_ORIENT, [USER]),
      ];
      const journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2, USER3],
        tags,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.update = jest.fn();

      // when
      const tagsUpdateDto = new TagsUpdateDTO([
        new TagCreateDTO(FIRST_TOPIC, FIRST_ORIENT),
        new TagCreateDTO(FOURTH_TOPIC, FOURTH_ORIENT),
      ]);
      await journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(1);
      expect(journeyRepository.update).toBeCalledWith(journey);
      const updatedTags = journey.tags;
      expect(updatedTags.length).toBe(2);
      expect(updatedTags[0].users).toEqual([USER2, USER3, USER]);
      expect(updatedTags[1].users).toEqual([USER]);
    });

    it('userId에 해당하는 user가 없을 경우 InvalidJwtPayloadException을 throw한다.', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      const tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, [USER2, USER3]),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, [USER]),
        new Tag(THIRD_TOPIC, THIRD_ORIENT, [USER]),
      ];
      const journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2, USER3],
        tags,
        [],
        [[], [], []],
      ) as JourneyDocument;
      journeyRepository.get = jest.fn().mockResolvedValue(journey);
      journeyRepository.update = jest.fn();

      // then
      const tagsUpdateDto = new TagsUpdateDTO([
        new TagCreateDTO(FIRST_TOPIC, FIRST_ORIENT),
        new TagCreateDTO(FOURTH_TOPIC, FOURTH_ORIENT),
      ]);
      await expect(
        journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID),
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
      const tagsUpdateDto = new TagsUpdateDTO([
        new TagCreateDTO(FIRST_TOPIC, FIRST_ORIENT),
        new TagCreateDTO(FOURTH_TOPIC, FOURTH_ORIENT),
      ]);
      await expect(
        journeyService.updateTags(tagsUpdateDto, JOURNEY_ID, USER_ID),
      ).rejects.toThrow(new JourneyNotExistException(JOURNEY_NOT_EXIST_MSG));
      expect(journeyRepository.get).toBeCalledTimes(1);
      expect(journeyRepository.get).toBeCalledWith(JOURNEY_ID, false);
      expect(journeyRepository.update).toBeCalledTimes(0);
    });
  });
});

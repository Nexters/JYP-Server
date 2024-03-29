import { Test, TestingModule } from '@nestjs/testing';
import { UserResponseDTO } from '../user/dtos/user.dto';
import { PERSONALITY } from '../user/schemas/personality';
import { User } from '../user/schemas/user.schema';
import {
  TagUpdateRequestDTO,
  JourneyCreateRequestDTO,
  IdResponseDTO,
  PikmiCreateRequestDTO,
  PikisUpdateRequestDTO,
  PikiUpdateRequestDTO,
  IdsResponseDTO,
  TagsUpdateRequestDTO,
  JourneyResponseDTO,
  DefaultTagsResponseDTO,
  DefaultTagResponseDTO,
  TagsResponseDTO,
  TagResponseDTO,
  PikidayResponseDTO,
} from './dtos/journey.dto';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';
import { Tag, Journey, JourneyDocument } from './schemas/journey.schema';

const JOURNEY_NAME = 'name';
const START_DATE = 1661299200;
const END_DATE = 1661558400; // 3일 차이
const THEME_PATH = 'path';
const FIRST_TOPIC = 'topic1';
const FIRST_ORIENT = 'like';
const SECOND_TOPIC = 'topic2';
const SECOND_ORIENT = 'dislike';
const TAG_CREATE_DTOS = [
  new TagUpdateRequestDTO(FIRST_TOPIC, FIRST_ORIENT),
  new TagUpdateRequestDTO(SECOND_TOPIC, SECOND_ORIENT),
];
const JOURNEY_CREATE_DTO = new JourneyCreateRequestDTO(
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
const JOURNEY_ID = '630b28c08abfc3f96130789c';
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
const REQ = {
  user: { id: USER_ID },
};
const JOURNEY_ID_RESPONSE_DTO = new IdResponseDTO(JOURNEY_ID);
const PIKMI_NAME = 'pikmi';
const PIKMI_ADDR = 'pikmi addr';
const PIKMI_CATEGORY = 'P';
const PIKMI_LON = 129.4;
const PIKMI_LAT = 36.7;
const PIKMI_LINK = '/pikmi/link';
const PIKMI_CREATE_DTO = new PikmiCreateRequestDTO(
  PIKMI_NAME,
  PIKMI_ADDR,
  PIKMI_CATEGORY,
  PIKMI_LON,
  PIKMI_LAT,
  PIKMI_LINK,
);
const PIKMI_ID = '6312e10b0c2efac2742417bd';
const PIKMI_ID_RESPONSE_DTO = new IdResponseDTO(PIKMI_ID);
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
  new PikiUpdateRequestDTO(
    undefined,
    PIKI1_NAME,
    PIKI1_ADDR,
    PIKI1_CATEGORY,
    PIKI1_LON,
    PIKI1_LAT,
    PIKI1_LINK,
  ),
  new PikiUpdateRequestDTO(
    undefined,
    PIKI2_NAME,
    PIKI2_ADDR,
    PIKI2_CATEGORY,
    PIKI2_LON,
    PIKI2_LAT,
    PIKI2_LINK,
  ),
];
const PIKIS_UPDATE_DTO_NO_ID = new PikisUpdateRequestDTO(
  PIKI_INDEX,
  PIKI_UPDATE_DTOS_NO_ID,
);
const PIKIS_IDS_RESPONSE_DTO = new IdsResponseDTO(PIKI1_ID, PIKI2_ID);
const TAGS_UPDATE_DTO = new TagsUpdateRequestDTO(TAG_CREATE_DTOS);
const USER_RESPONSE_DTO = new UserResponseDTO(
  USER._id,
  USER.name,
  USER.img,
  PERSONALITY[USER.psn],
);
const EMPTY_PIKIDAY_RESPONSE_DTO = new PikidayResponseDTO([]);
const JOURNEY_RESPONSE_DTO = new JourneyResponseDTO(
  JOURNEY_ID,
  JOURNEY_NAME,
  START_DATE,
  END_DATE,
  THEME_PATH,
  [USER_RESPONSE_DTO],
  [],
  [],
  [
    EMPTY_PIKIDAY_RESPONSE_DTO,
    EMPTY_PIKIDAY_RESPONSE_DTO,
    EMPTY_PIKIDAY_RESPONSE_DTO,
  ],
);
const DEFAULT_TAGS_RESPONSE_DTO = new DefaultTagsResponseDTO([
  new DefaultTagResponseDTO(FIRST_TOPIC, FIRST_ORIENT),
  new DefaultTagResponseDTO(SECOND_TOPIC, SECOND_ORIENT),
]);
const TAGS_RESPONSE_DTO = new TagsResponseDTO([
  new TagResponseDTO(FIRST_TOPIC, FIRST_ORIENT, [USER_RESPONSE_DTO]),
  new TagResponseDTO(SECOND_TOPIC, SECOND_ORIENT, [USER_RESPONSE_DTO]),
]);

describe('JourneyController', () => {
  let journeyController: JourneyController;
  let journeyService: JourneyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JourneyController],
      providers: [
        {
          provide: JourneyService,
          useValue: {},
        },
      ],
    }).compile();

    journeyController = module.get<JourneyController>(JourneyController);
    journeyService = module.get<JourneyService>(JourneyService);
  });

  it('should be defined', () => {
    expect(journeyController).toBeDefined();
  });

  it('listUserJourneys는 JourneyService.listUserJourneys를 호출해 리턴한다.', async () => {
    // given
    const journeys = [JOURNEY, JOURNEY, JOURNEY];
    journeyService.listUserJourneys = jest.fn().mockResolvedValue(journeys);

    // when
    const result = await journeyController.listUserJourneys(REQ);

    // then
    expect(journeyService.listUserJourneys).toBeCalledTimes(1);
    expect(journeyService.listUserJourneys).toBeCalledWith(USER_ID);
    expect(result).toEqual(journeys);
  });

  it('getDefaultTags는 JourneyService.getDefaultTags를 호출해 리턴한다.', async () => {
    // given
    journeyService.getDefaultTags = jest
      .fn()
      .mockResolvedValue(DEFAULT_TAGS_RESPONSE_DTO);

    // when
    const result = await journeyController.getDefaultTags();

    // then
    expect(journeyService.getDefaultTags).toBeCalledTimes(1);
    expect(journeyService.getDefaultTags).toBeCalledWith();
    expect(result).toEqual(DEFAULT_TAGS_RESPONSE_DTO);
  });

  it('getJourney는 JourneyService.getJourney를 호출해 리턴한다.', async () => {
    // given
    journeyService.getJourney = jest
      .fn()
      .mockResolvedValue(JOURNEY_RESPONSE_DTO);

    // when
    const result = await journeyController.getJourney(JOURNEY_ID);

    // then
    expect(journeyService.getJourney).toBeCalledTimes(1);
    expect(journeyService.getJourney).toBeCalledWith(JOURNEY_ID);
    expect(result).toEqual(JOURNEY_RESPONSE_DTO);
  });

  it('getTags는 JourneyService.getTags를 호출해 리턴한다.', async () => {
    // given
    journeyService.getTags = jest.fn().mockResolvedValue(TAGS_RESPONSE_DTO);

    // when
    const result = await journeyController.getTags(JOURNEY_ID, true);

    // then
    expect(journeyService.getTags).toBeCalledTimes(1);
    expect(journeyService.getTags).toBeCalledWith(JOURNEY_ID, true);
    expect(result).toEqual(TAGS_RESPONSE_DTO);
  });

  it('createJourney는 JourneyService.createJourney를 호출해 리턴한다.', async () => {
    // given
    journeyService.createJourney = jest
      .fn()
      .mockResolvedValue(JOURNEY_ID_RESPONSE_DTO);

    // when
    const result = await journeyController.createJourney(
      JOURNEY_CREATE_DTO,
      REQ,
    );

    // then
    expect(journeyService.createJourney).toBeCalledTimes(1);
    expect(journeyService.createJourney).toBeCalledWith(
      JOURNEY_CREATE_DTO,
      USER_ID,
    );
    expect(result).toEqual(JOURNEY_ID_RESPONSE_DTO);
  });

  it('createPikmi는 JourneyService.createPikmi를 호출해 리턴한다.', async () => {
    // given
    journeyService.createPikmi = jest
      .fn()
      .mockResolvedValue(PIKMI_ID_RESPONSE_DTO);

    // when
    const result = await journeyController.createPikmi(
      JOURNEY_ID,
      PIKMI_CREATE_DTO,
      REQ,
    );

    // then
    expect(journeyService.createPikmi).toBeCalledTimes(1);
    expect(journeyService.createPikmi).toBeCalledWith(
      PIKMI_CREATE_DTO,
      JOURNEY_ID,
      USER_ID,
    );
    expect(result).toEqual(PIKMI_ID_RESPONSE_DTO);
  });

  it('updatePiki는 JourneyService.updatePiki를 호출해 리턴한다.', async () => {
    // given
    journeyService.updatePiki = jest
      .fn()
      .mockResolvedValue(PIKIS_IDS_RESPONSE_DTO);

    // when
    const result = await journeyController.updatePiki(
      JOURNEY_ID,
      PIKIS_UPDATE_DTO_NO_ID,
      REQ,
    );

    // then
    expect(journeyService.updatePiki).toBeCalledTimes(1);
    expect(journeyService.updatePiki).toBeCalledWith(
      PIKIS_UPDATE_DTO_NO_ID,
      JOURNEY_ID,
      USER_ID,
    );
    expect(result).toStrictEqual(PIKIS_IDS_RESPONSE_DTO);
  });

  it('updateTags는 JourneyService.updateTags를 호출한다.', async () => {
    // given
    journeyService.updateTags = jest.fn();

    // when
    await journeyController.updateTags(JOURNEY_ID, TAGS_UPDATE_DTO, REQ);

    // then
    expect(journeyService.updateTags).toBeCalledTimes(1);
    expect(journeyService.updateTags).toBeCalledWith(
      TAGS_UPDATE_DTO,
      JOURNEY_ID,
      USER_ID,
    );
  });

  it('addUserToJourney는 JourneyService.addUserToJourney와 JourneyService.updateTags를 호출한다.', async () => {
    // given
    journeyService.addUserToJourney = jest.fn();
    journeyService.updateTags = jest.fn();

    // when
    await journeyController.addUserToJourney(JOURNEY_ID, TAGS_UPDATE_DTO, REQ);

    // then
    expect(journeyService.addUserToJourney).toBeCalledTimes(1);
    expect(journeyService.addUserToJourney).toBeCalledWith(JOURNEY_ID, USER_ID);
    expect(journeyService.updateTags).toBeCalledTimes(1);
    expect(journeyService.updateTags).toBeCalledWith(
      TAGS_UPDATE_DTO,
      JOURNEY_ID,
      USER_ID,
    );
  });

  it('deleteUserFromJourney는 JourneyService.deleteUserFromJourney를 호출한다.', async () => {
    // given
    journeyService.deleteUserFromJourney = jest.fn();

    // when
    await journeyController.deleteUserFromJourney(JOURNEY_ID, REQ);

    // then
    expect(journeyService.deleteUserFromJourney).toBeCalledTimes(1);
    expect(journeyService.deleteUserFromJourney).toBeCalledWith(
      JOURNEY_ID,
      USER_ID,
    );
  });

  it('addLikesToPikmi는 JourneyService.addLikesToPikmi를 호출한다.', async () => {
    // given
    journeyService.addLikesToPikmi = jest.fn();

    // when
    await journeyController.addLikesToPikmi(JOURNEY_ID, PIKMI_ID, REQ);

    // then
    expect(journeyService.addLikesToPikmi).toBeCalledTimes(1);
    expect(journeyService.addLikesToPikmi).toBeCalledWith(
      JOURNEY_ID,
      PIKMI_ID,
      USER_ID,
    );
  });

  it('deleteLikesFromPikmi는 JourneyService.deleteLikesFromPikmi를 호출한다.', async () => {
    // given
    journeyService.deleteLikesFromPikmi = jest.fn();

    // when
    await journeyController.deleteLikesFromPikmi(JOURNEY_ID, PIKMI_ID, REQ);

    // then
    expect(journeyService.deleteLikesFromPikmi).toBeCalledTimes(1);
    expect(journeyService.deleteLikesFromPikmi).toBeCalledWith(
      JOURNEY_ID,
      PIKMI_ID,
      USER_ID,
    );
  });
});

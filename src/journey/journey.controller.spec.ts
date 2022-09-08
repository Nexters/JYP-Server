import { Test, TestingModule } from '@nestjs/testing';
import {
  TagCreateDTO,
  JourneyCreateDTO,
  IdResponseDTO,
  PikmiCreateDTO,
  PikisUpdateDTO,
  PikiUpdateDTO,
  IdsResponseDTO,
  TagsUpdateDTO,
} from './dtos/journey.dto';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';

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
const REQ = {
  user: { id: USER_ID },
};
const JOURNEY_ID = '630b28c08abfc3f96130789c';
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
const PIKIS_UPDATE_DTO_NO_ID = new PikisUpdateDTO(
  PIKI_INDEX,
  PIKI_UPDATE_DTOS_NO_ID,
);
const PIKIS_IDS_RESPONSE_DTO = new IdsResponseDTO(PIKI1_ID, PIKI2_ID);
const TAGS_UPDATE_DTO = new TagsUpdateDTO(TAG_CREATE_DTOS);

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
});

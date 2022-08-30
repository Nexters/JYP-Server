import { Test, TestingModule } from '@nestjs/testing';
import {
  TagCreateDTO,
  JourneyCreateDTO,
  IdResponseDTO,
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
const ID_RESPONSE_DTO = new IdResponseDTO(JOURNEY_ID);

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
    journeyService.createJourney = jest.fn().mockResolvedValue(ID_RESPONSE_DTO);

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
    expect(result).toEqual(ID_RESPONSE_DTO);
  });
});

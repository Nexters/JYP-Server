import { Test, TestingModule } from '@nestjs/testing';
import { Option } from 'prelude-ts';
import { AuthVendor } from '../auth/authVendor';
import {
  UserCreateRequestDTO,
  UserUpdateRequestDTO,
  UserDeleteResponseDTO,
} from './dtos/user.dto';
import { PERSONALITY } from './schemas/personality';
import { User } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { generateId } from '../common/util';
import { Journey, JourneyDocument } from '../journey/schemas/journey.schema';
import mongoose from 'mongoose';
import { JourneyRepository } from '../journey/journey.repository';
import { JourneyService } from '../journey/journey.service';

const AUTH_VENDOR = AuthVendor.KAKAO;
const AUTH_ID = 'id';
const ID = generateId(AUTH_VENDOR, AUTH_ID);
const NAME = 'name';
const IMG = '/image/path';
const PSN_ID = 'ME';
const USER = new User(ID, NAME, IMG, PSN_ID);
const AUTH_ID2 = 'id2';
const ID2 = generateId(AUTH_VENDOR, AUTH_ID2);
const USER2 = new User(ID2, NAME, IMG, PSN_ID);
const JOURNEY_ID = '630b28c08abfc3f96130789c';
const JOURNEY_NAME = 'name';
const START_DATE = 1661299200;
const END_DATE = 1661558400; // 3일 차이
const THEME_PATH = 'path';
const JOURNEY = new Journey(
  JOURNEY_NAME,
  START_DATE,
  END_DATE,
  THEME_PATH,
  [USER, USER2],
  [],
  [],
  [[], [], []],
) as JourneyDocument;
JOURNEY._id = new mongoose.Types.ObjectId(JOURNEY_ID);

describe('UserService', () => {
  let userRepository: UserRepository;
  let userService: UserService;
  let journeyRepository: JourneyRepository;
  let journeyService: JourneyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {},
        },
        {
          provide: JourneyService,
          useValue: {},
        },
        {
          provide: JourneyRepository,
          useValue: {},
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userService = module.get<UserService>(UserService);
    journeyRepository = module.get<JourneyRepository>(JourneyRepository);
    journeyService = module.get<JourneyService>(JourneyService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('getUser는 UserRepository.findOne을 호출해 데이터를 받아 Option<UserDTO>로 돌려준다', async () => {
    // given
    userRepository.findOne = jest.fn().mockResolvedValue(USER);

    // when
    const result = await userService.getUser(ID);

    // then
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith(ID);
    const optionContent = result.getOrUndefined();
    expect(optionContent.id).toBe(USER._id);
    expect(optionContent.name).toBe(USER.name);
    expect(optionContent.profileImagePath).toBe(USER.img);
    expect(optionContent.personality).toBe(PERSONALITY[USER.psn]);
  });

  it('UserRepository.findOne이 null을 리턴할 경우 getUser는 None을 리턴한다', async () => {
    // given
    userRepository.findOne = jest.fn().mockResolvedValue(null);

    // when
    const result = await userService.getUser(ID);

    // then
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith(ID);
    expect(result).toBe(Option.none());
  });

  it('updateUser는 UserRepository.updateOne을 호출해 데이터를 받아 UserDTO로 돌려준다', async () => {
    // given
    userRepository.updateOne = jest.fn().mockResolvedValue(USER);

    // when
    const userUpdateDTO = new UserUpdateRequestDTO(NAME, IMG);
    const result = await userService.updateUser(ID, userUpdateDTO);

    // then
    expect(userRepository.updateOne).toBeCalledTimes(1);
    expect(userRepository.updateOne).toBeCalledWith(ID, NAME, IMG);
    expect(result.id).toBe(USER._id);
    expect(result.name).toBe(USER.name);
    expect(result.profileImagePath).toBe(USER.img);
    expect(result.personality).toBe(PERSONALITY[USER.psn]);
  });

  it('createUser는 UserRepository.insertOne을 호출한다', async () => {
    // given
    userRepository.insertOne = jest.fn().mockResolvedValue(USER);

    // when
    const userCreateDTO = new UserCreateRequestDTO(NAME, IMG, PSN_ID);
    const result = await userService.createUser(userCreateDTO, ID);

    // then
    expect(userRepository.insertOne).toBeCalledTimes(1);
    expect(userRepository.insertOne).toBeCalledWith(ID, NAME, IMG, PSN_ID);
    expect(result.id).toBe(USER._id);
    expect(result.name).toBe(USER.name);
    expect(result.profileImagePath).toBe(USER.img);
    expect(result.personality).toBe(PERSONALITY[USER.psn]);
  });

  // describe('deleteUser', () => {
  //   beforeEach(async () => {
  //     // given
  //     userRepository.findOne = jest.fn().mockResolvedValue(USER);
  //     JourneyRepository.
  //   })
  // })

  it('deleteUser는 인자로 ID를 받아 UserRepository.deleteOne을 호출해 데이터를 삭제한다', async () => {
    // given
    const userDeleteDTO = new UserDeleteResponseDTO(true, 1);
    userRepository.deleteOne = jest.fn().mockResolvedValue(userDeleteDTO);

    // when
    const result = await userService.deleteUser(ID);

    // then
    expect(userRepository.deleteOne).toBeCalledTimes(1);
    expect(userRepository.deleteOne).toBeCalledWith(ID);
    expect(result.acknowledged).toBe(true);
    expect(result.deletedCount).toBe(1);
  });
});

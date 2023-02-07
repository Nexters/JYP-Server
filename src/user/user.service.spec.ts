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
import {
  NotFoundUserException,
  UserDeletionFailedException,
} from '../common/exceptions';
import { USER_DELETION_FAILED_MSG } from '../http/http-exception.messages';
import { INVALID_ID_IN_JWT_MSG } from '../common/validation/validation.messages';

const AUTH_VENDOR = AuthVendor.KAKAO;
const AUTH_ID = 'id';
const USER_ID = generateId(AUTH_VENDOR, AUTH_ID);
const NAME = 'name';
const IMG = '/image/path';
const PSN_ID = 'ME';
const USER = new User(USER_ID, NAME, IMG, PSN_ID);
const AUTH_ID2 = 'id2';
const USER_ID2 = generateId(AUTH_VENDOR, AUTH_ID2);
const USER2 = new User(USER_ID2, NAME, IMG, PSN_ID);
const USER_DELETE_SECCESS_DTO = new UserDeleteResponseDTO(true, 1);
const USER_DELETE_FAIL_DTO = new UserDeleteResponseDTO(true, 0);
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
    const result = await userService.getUser(USER_ID);

    // then
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith(USER_ID);
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
    const result = await userService.getUser(USER_ID);

    // then
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith(USER_ID);
    expect(result).toBe(Option.none());
  });

  it('updateUser는 UserRepository.updateOne을 호출해 데이터를 받아 UserDTO로 돌려준다', async () => {
    // given
    userRepository.updateOne = jest.fn().mockResolvedValue(USER);

    // when
    const userUpdateDTO = new UserUpdateRequestDTO(NAME, IMG);
    const result = await userService.updateUser(USER_ID, userUpdateDTO);

    // then
    expect(userRepository.updateOne).toBeCalledTimes(1);
    expect(userRepository.updateOne).toBeCalledWith(USER_ID, NAME, IMG);
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
    const result = await userService.createUser(userCreateDTO, USER_ID);

    // then
    expect(userRepository.insertOne).toBeCalledTimes(1);
    expect(userRepository.insertOne).toBeCalledWith(USER_ID, NAME, IMG, PSN_ID);
    expect(result.id).toBe(USER._id);
    expect(result.name).toBe(USER.name);
    expect(result.profileImagePath).toBe(USER.img);
    expect(result.personality).toBe(PERSONALITY[USER.psn]);
  });

  describe('deleteUser', () => {
    beforeEach(async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(USER);
      const journey = structuredClone(JOURNEY);
      journey._id = new mongoose.Types.ObjectId(JOURNEY_ID);
      const journeys = [journey, journey, journey];
      journeyRepository.listByUser = jest.fn().mockResolvedValue(journeys);
      journeyService.deleteUserFromJourney = jest.fn();
      userRepository.deleteOne = jest
        .fn()
        .mockResolvedValue(USER_DELETE_SECCESS_DTO);
    });

    it('유저가 포함된 저니에서 유저를 삭제한 후 유저 데이터를 삭제한다', async () => {
      // when
      const result = await userService.deleteUser(USER_ID);

      // then
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyRepository.listByUser).toBeCalledTimes(1);
      expect(journeyRepository.listByUser).toBeCalledWith(USER);
      expect(journeyService.deleteUserFromJourney).toBeCalledTimes(3);
      expect(journeyService.deleteUserFromJourney).toBeCalledWith(
        JOURNEY_ID,
        USER_ID,
      );
      expect(userRepository.deleteOne).toBeCalledTimes(1);
      expect(userRepository.deleteOne).toBeCalledWith(USER_ID);
      expect(result).toEqual(USER_DELETE_SECCESS_DTO);
    });

    it('userId에 해당하는 user가 없을 경우 NotFoundUserException을 throw한다', async () => {
      // given
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      // then
      await expect(userService.deleteUser(USER_ID)).rejects.toThrow(
        new NotFoundUserException(INVALID_ID_IN_JWT_MSG),
      );
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyService.deleteUserFromJourney).toBeCalledTimes(0);
      expect(userRepository.deleteOne).toBeCalledTimes(0);
    });

    it('journeyService.deleteUserFromJourney를 호출하는 도중 에러가 발생할 경우 저니에서 유저 데이터 삭제를 중단하고 UserDeletionFailedException을 throw한다', async () => {
      // given
      journeyService.deleteUserFromJourney = jest
        .fn()
        .mockImplementation(() => {
          throw new Error();
        });

      // then
      await expect(userService.deleteUser(USER_ID)).rejects.toThrow(
        new UserDeletionFailedException(USER_DELETION_FAILED_MSG),
      );
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyService.deleteUserFromJourney).toBeCalledTimes(1);
      expect(journeyService.deleteUserFromJourney).toBeCalledWith(
        JOURNEY_ID,
        USER_ID,
      );
      expect(userRepository.deleteOne).toBeCalledTimes(0);
    });

    it('userRepository.deleteOne의 리턴값에서 deletedCount가 0이면 UserDeletionFailedException을 throw한다', async () => {
      // given
      userRepository.deleteOne = jest
        .fn()
        .mockResolvedValue(USER_DELETE_FAIL_DTO);

      // then
      await expect(userService.deleteUser(USER_ID)).rejects.toThrow(
        new UserDeletionFailedException(USER_DELETION_FAILED_MSG),
      );
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith(USER_ID);
      expect(journeyService.deleteUserFromJourney).toBeCalledTimes(3);
      expect(journeyService.deleteUserFromJourney).toBeCalledWith(
        JOURNEY_ID,
        USER_ID,
      );
      expect(userRepository.deleteOne).toBeCalledTimes(1);
      expect(userRepository.deleteOne).toBeCalledWith(USER_ID);
    });
  });
});

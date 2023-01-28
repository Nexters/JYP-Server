import { Test, TestingModule } from '@nestjs/testing';
import { Option } from 'prelude-ts';
import { AuthVendor } from '../auth/authVendor';
import { createMock } from 'ts-auto-mock';
import { On, method } from 'ts-auto-mock/extension';
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

const AUTH_VENDOR = AuthVendor.KAKAO;
const AUTH_ID = 'id';
const ID = generateId(AUTH_VENDOR, AUTH_ID);
const NAME = 'name';
const IMG = '/image/path';
const PSN_ID = 'ME';
const USER = new User(ID, NAME, IMG, PSN_ID);

describe('UserService', () => {
  let userRepository: UserRepository;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UserRepository],
    })
      .overrideProvider(UserRepository)
      .useValue(createMock<UserRepository>())
      .compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('getUser는 UserRepository.findOne을 호출해 데이터를 받아 Option<UserDTO>로 돌려준다', async () => {
    // given
    const findOne = On(userRepository)
      .get(method(() => userRepository.findOne))
      .mockResolvedValue(USER);

    // when
    const result = await userService.getUser(ID);

    // then
    expect(findOne).toBeCalledTimes(1);
    expect(findOne).toBeCalledWith(ID);
    const optionContent = result.getOrUndefined();
    expect(optionContent.id).toBe(USER._id);
    expect(optionContent.name).toBe(USER.name);
    expect(optionContent.profileImagePath).toBe(USER.img);
    expect(optionContent.personality).toBe(PERSONALITY[USER.psn]);
  });

  it('deleteUser는 인자로 ID를 받아 UserRepository.deleteOne을 호출해 데이터를 삭제한다', async () => {
    // given
    const userDeleteDTO = new UserDeleteResponseDTO(true, 1);
    const deleteOne = On(userRepository)
      .get(method(() => userRepository.deleteOne))
      .mockResolvedValue(userDeleteDTO);

    // when
    const result = await userService.deleteUser(ID);

    // then
    expect(deleteOne).toBeCalledTimes(1);
    expect(deleteOne).toBeCalledWith(ID);
    expect(result.acknowledged).toBe(true);
    expect(result.deletedCount).toBe(1);
  });

  it('UserRepository.findOne이 null을 리턴할 경우 getUser는 None을 리턴한다', async () => {
    // given
    const findOne = On(userRepository)
      .get(method(() => userRepository.findOne))
      .mockResolvedValue(null);

    // when
    const result = await userService.getUser(ID);

    // then
    expect(findOne).toBeCalledTimes(1);
    expect(findOne).toBeCalledWith(ID);
    expect(result).toBe(Option.none());
  });

  it('updateUser는 UserRepository.updateOne을 호출해 데이터를 받아 UserDTO로 돌려준다', async () => {
    // given
    const updateOne = On(userRepository)
      .get(method(() => userRepository.updateOne))
      .mockResolvedValue(USER);

    // when
    const userUpdateDTO = new UserUpdateRequestDTO(NAME, IMG);
    const result = await userService.updateUser(ID, userUpdateDTO);

    // then
    expect(updateOne).toBeCalledTimes(1);
    expect(updateOne).toBeCalledWith(ID, NAME, IMG);
    expect(result.id).toBe(USER._id);
    expect(result.name).toBe(USER.name);
    expect(result.profileImagePath).toBe(USER.img);
    expect(result.personality).toBe(PERSONALITY[USER.psn]);
  });

  it('createUser는 UserRepository.insertOne을 호출한다', async () => {
    // given
    const insertOne = On(userRepository)
      .get(method(() => userRepository.insertOne))
      .mockResolvedValue(USER);

    // when
    const userCreateDTO = new UserCreateRequestDTO(NAME, IMG, PSN_ID);
    const result = await userService.createUser(userCreateDTO, ID);

    // then
    expect(insertOne).toBeCalledTimes(1);
    expect(insertOne).toBeCalledWith(ID, NAME, IMG, PSN_ID);
    expect(result.id).toBe(USER._id);
    expect(result.name).toBe(USER.name);
    expect(result.profileImagePath).toBe(USER.img);
    expect(result.personality).toBe(PERSONALITY[USER.psn]);
  });
});

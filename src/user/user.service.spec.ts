import { Test, TestingModule } from '@nestjs/testing';
import { Option } from 'prelude-ts';
import { AuthVendor } from '../auth/authVendor';
import { createMock } from 'ts-auto-mock';
import { On, method } from 'ts-auto-mock/extension';
import { UserCreateDTO, UserUpdateDTO } from './dtos/user.dto';
import { PERSONALITY } from './schemas/personality';
import { User } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

const AUTH_VENDOR = AuthVendor.KAKAO;
const AUTH_ID = 'id';
const ID = 'kakao-id';
const NICKNAME = 'nickname';
const IMG = '/image/path';
const PSN = PERSONALITY.ME;
const user = new User();

describe('UserService', () => {
  let userRepository: UserRepository;
  let userService: UserService;

  beforeEach(async () => {
    user._id = ID;
    user.name = NICKNAME;
    user.img = IMG;
    user.psn = PSN;
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
      .mockResolvedValue(user);

    // when
    const result = await userService.getUser(ID);

    // then
    expect(findOne).toBeCalledTimes(1);
    expect(findOne).toBeCalledWith(ID);
    const optionContent = result.getOrUndefined();
    expect(optionContent.id).toBe(user._id);
    expect(optionContent.nickname).toBe(user.name);
    expect(optionContent.profileImagePath).toBe(user.img);
    expect(optionContent.personality).toBe(PERSONALITY[user.psn]);
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
      .mockResolvedValue(user);

    // when
    const userUpdateDTO = new UserUpdateDTO(NICKNAME, IMG);
    const result = await userService.updateUser(ID, userUpdateDTO);

    // then
    expect(updateOne).toBeCalledTimes(1);
    expect(updateOne).toBeCalledWith(ID, NICKNAME, IMG);
    expect(result.id).toBe(user._id);
    expect(result.nickname).toBe(user.name);
    expect(result.profileImagePath).toBe(user.img);
    expect(result.personality).toBe(PERSONALITY[user.psn]);
  });

  it('createUser는 UserRepository.insertOne을 호출한다', async () => {
    // given
    const insertOne = On(userRepository)
      .get(method(() => userRepository.insertOne))
      .mockResolvedValue(user);

    // when
    const userCreateDTO = new UserCreateDTO(
      AUTH_VENDOR,
      AUTH_ID,
      NICKNAME,
      IMG,
      PSN,
    );
    const result = await userService.createUser(userCreateDTO);

    // then
    expect(insertOne).toBeCalledTimes(1);
    expect(insertOne).toBeCalledWith(ID, NICKNAME, IMG, PSN);
    expect(result.id).toBe(user._id);
    expect(result.nickname).toBe(user.name);
    expect(result.profileImagePath).toBe(user.img);
    expect(result.personality).toBe(PERSONALITY[user.psn]);
  });

  it('generateId는 정해진 형식대로 ID를 생성한다', () => {
    // when
    const id = userService.generateId(AUTH_VENDOR, AUTH_ID);

    // then
    expect(id).toBe(ID);
  });
});

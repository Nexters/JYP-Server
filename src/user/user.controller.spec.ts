import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Option } from 'prelude-ts';
import { createMock } from 'ts-auto-mock';
import { On, method } from 'ts-auto-mock/extension';
import {
  UserCreateRequestDTO,
  UserDeleteResponseDTO,
  UserResponseDTO,
  UserUpdateRequestDTO,
} from './dtos/user.dto';
import { PERSONALITY } from './schemas/personality';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const ID = 'id';
const NAME = 'name';
const IMG = '/image/path';
const PSN = PERSONALITY.ME;
const userDTO = new UserResponseDTO(ID, NAME, IMG, PERSONALITY[PSN]);
const REQ = {
  user: { id: ID },
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
      controllers: [UserController],
    })
      .overrideProvider(UserService)
      .useValue(createMock<UserService>())
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('getUser는 JWT payload의 id를 UserService.getUser의 파라미터로 넣어 호출한다', async () => {
    // given
    const getUser = On(userService)
      .get(method(() => userService.getUser))
      .mockResolvedValue(Option.of(userDTO));

    // when
    const result = await userController.getMyUser(REQ);

    // then
    expect(getUser).toBeCalledTimes(1);
    expect(getUser).toBeCalledWith(ID);
    expect(result).toEqual(userDTO);
  });

  it('getUser는 UserService.getUser를 호출해 데이터를 받아 리턴한다', async () => {
    // given
    const getUser = On(userService)
      .get(method(() => userService.getUser))
      .mockResolvedValue(Option.of(userDTO));

    // when
    const result = await userController.getUser(ID);

    // then
    expect(getUser).toBeCalledTimes(1);
    expect(getUser).toBeCalledWith(ID);
    expect(result).toEqual(userDTO);
  });

  it('UserService.getUser가 None을 리턴할 때 getUser는 NotFoundException을 throw한다', async () => {
    // given
    On(userService)
      .get(method(() => userService.getUser))
      .mockResolvedValue(Option.none());

    // then
    expect(userController.getUser(ID)).rejects.toThrow(new NotFoundException());
  });

  it('updateUser는 UserService.updateUser를 호출해 데이터를 받아 리턴한다', async () => {
    // given
    const updateUser = On(userService)
      .get(method(() => userService.updateUser))
      .mockResolvedValue(userDTO);

    // when
    const userUpdateDTO = new UserUpdateRequestDTO(NAME, IMG);
    const result = await userController.updateUser(ID, userUpdateDTO);

    // then
    expect(updateUser).toBeCalledTimes(1);
    expect(updateUser).toBeCalledWith(ID, userUpdateDTO);
    expect(result).toEqual(userDTO);
  });

  it('createUser는 UserService.createUser를 호출해 데이터를 받아 리턴한다', async () => {
    // given
    const createUser = On(userService)
      .get(method(() => userService.createUser))
      .mockResolvedValue(userDTO);

    // when
    const userCreateDTO = new UserCreateRequestDTO(NAME, IMG, PSN);
    const result = await userController.createUser(userCreateDTO, REQ);

    // then
    expect(createUser).toBeCalledTimes(1);
    expect(createUser).toBeCalledWith(userCreateDTO, ID);
    expect(result).toEqual(userDTO);
  });

  it('deleteUser는 UserService.deleteUser를 호출해 유저를 삭제한다', async () => {
    // given
    const userDeleteDTO = new UserDeleteResponseDTO(true, 1);
    const deleteUser = On(userService)
      .get(method(() => userService.deleteUser))
      .mockResolvedValue(userDeleteDTO);

    // when
    const result = await userController.deleteUser(ID);

    // then
    expect(deleteUser).toBeCalledTimes(1);
    expect(deleteUser).toBeCalledWith(ID);
    expect(result).toEqual(userDeleteDTO);
  });
});

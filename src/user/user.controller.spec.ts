import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Option } from 'prelude-ts';
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
      providers: [
        {
          provide: UserService,
          useValue: {},
        },
      ],
      controllers: [UserController],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('getUser는 JWT payload의 id를 UserService.getUser의 파라미터로 넣어 호출한다', async () => {
    // given
    userService.getUser = jest.fn().mockResolvedValue(Option.of(userDTO));

    // when
    const result = await userController.getMyUser(REQ);

    // then
    expect(userService.getUser).toBeCalledTimes(1);
    expect(userService.getUser).toBeCalledWith(ID);
    expect(result).toEqual(userDTO);
  });

  it('getUser는 UserService.getUser를 호출해 데이터를 받아 리턴한다', async () => {
    // given
    userService.getUser = jest.fn().mockResolvedValue(Option.of(userDTO));

    // when
    const result = await userController.getUser(ID);

    // then
    expect(userService.getUser).toBeCalledTimes(1);
    expect(userService.getUser).toBeCalledWith(ID);
    expect(result).toEqual(userDTO);
  });

  it('UserService.getUser가 None을 리턴할 때 getUser는 NotFoundException을 throw한다', async () => {
    // given
    userService.getUser = jest.fn().mockResolvedValue(Option.none());

    // then
    expect(userController.getUser(ID)).rejects.toThrow(new NotFoundException());
  });

  it('updateUser는 UserService.updateUser를 호출해 데이터를 받아 리턴한다', async () => {
    // given
    userService.updateUser = jest.fn().mockResolvedValue(userDTO);

    // when
    const userUpdateDTO = new UserUpdateRequestDTO(NAME, IMG);
    const result = await userController.updateUser(ID, userUpdateDTO);

    // then
    expect(userService.updateUser).toBeCalledTimes(1);
    expect(userService.updateUser).toBeCalledWith(ID, userUpdateDTO);
    expect(result).toEqual(userDTO);
  });

  it('createUser는 UserService.createUser를 호출해 데이터를 받아 리턴한다', async () => {
    // given
    userService.createUser = jest.fn().mockResolvedValue(userDTO);

    // when
    const userCreateDTO = new UserCreateRequestDTO(NAME, IMG, PSN);
    const result = await userController.createUser(userCreateDTO, REQ);

    // then
    expect(userService.createUser).toBeCalledTimes(1);
    expect(userService.createUser).toBeCalledWith(userCreateDTO, ID);
    expect(result).toEqual(userDTO);
  });

  it('deleteUser는 UserService.deleteUser를 호출해 유저를 삭제한다', async () => {
    // given
    const userDeleteDTO = new UserDeleteResponseDTO(true, 1);
    userService.deleteUser = jest.fn().mockResolvedValue(userDeleteDTO);

    // when
    const result = await userController.deleteUser(ID);

    // then
    expect(userService.deleteUser).toBeCalledTimes(1);
    expect(userService.deleteUser).toBeCalledWith(ID);
    expect(result).toEqual(userDeleteDTO);
  });
});

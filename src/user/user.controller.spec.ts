import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Option } from 'prelude-ts';
import { createMock } from 'ts-auto-mock';
import { On, method } from 'ts-auto-mock/extension';
import { UserResponseDTO, UserUpdateRequestDTO } from './dtos/user.dto';
import { PERSONALITY } from './schemas/personality';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const ID = 'id';
const NAME = 'name';
const IMG = '/image/path';
const PSN = PERSONALITY.ME;
const userDTO = new UserResponseDTO(ID, NAME, IMG, PERSONALITY[PSN]);

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
});

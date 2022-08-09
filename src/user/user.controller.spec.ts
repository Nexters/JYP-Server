import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from 'ts-auto-mock';
import { On, method } from 'ts-auto-mock/extension';
import { UserDTO, UserUpdateDTO } from './dtos/user.dto';
import { PERSONALITY } from './schemas/personality';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const ID = 'id';
const NICKNAME = 'nickname';
const IMG = '/image/path';
const PSN = PERSONALITY.ME;
const userDTO = new UserDTO(ID, NICKNAME, IMG, PERSONALITY[PSN]);

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
      .mockResolvedValue(userDTO);

    // when
    const result = await userController.getUser(ID);

    // then
    expect(getUser).toBeCalledTimes(1);
    expect(getUser).toBeCalledWith(ID);
    expect(result).toEqual(userDTO);
  });

  it('updateUser는 UserService.updateUser를 호출해 데이터를 받아 리턴한다', async () => {
    // given
    const updateUser = On(userService)
      .get(method(() => userService.updateUser))
      .mockResolvedValue(userDTO);

    // when
    const userUpdateDTO = new UserUpdateDTO(NICKNAME, IMG);
    const result = await userController.updateUser(ID, userUpdateDTO);

    // then
    expect(updateUser).toBeCalledTimes(1);
    expect(updateUser).toBeCalledWith(ID, userUpdateDTO);
    expect(result).toEqual(userDTO);
  });
});

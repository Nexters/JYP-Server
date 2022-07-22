import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AuthService, {
        provide: APP_PIPE,
        useClass: ValidationPipe
      }],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: API 추가 시 재 작성
  test('class-validation 정상 동작 확인', async () => {
    // @ts-ignore
    expect(await controller.getKakaoUserInfo(
      { accessToken: 'zjZ7Wo1Mak60pjlbwL2d5ko7fXUNSD8LTCQJFrc7CilwngAAAYImx4E4' })).toBeDefined()
  }, 60000);
});

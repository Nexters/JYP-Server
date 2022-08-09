import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthController } from './auth.controller';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        AuthService,
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
      controllers: [AuthController],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('카카오 API 정상 동작 확인', async () => {
    expect(await service.getAuthToken()).not.toBeUndefined();
  }, 60000);
});

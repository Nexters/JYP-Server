import { NestApplication } from '@nestjs/core';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/user/schemas/user.schema';
import { UserModule } from '../src/user/user.module';
import request from 'supertest';
import { ConsoleLogger, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PERSONALITY } from '../src/user/schemas/personality';
import { AuthVendor } from '../src/auth/authVendor';
import { generateId } from '../src/common/util';
import {
  Journey,
  JourneyDocument,
} from '../src/journey/schemas/journey.schema';
import { JourneyModule } from '../src/journey/journey.module';
import { UserRepository } from '../src/user/user.repository';
import { JourneyService } from '../src/journey/journey.service';
import { UserDeleteResponseDTO } from '../src/user/dtos/user.dto';

const AUTH_VENDOR = AuthVendor.KAKAO;
const AUTH_ID = '1234';
const AUTH_ID2 = '2345';
const USER_ID = generateId(AUTH_VENDOR, AUTH_ID);
const USER_ID2 = generateId(AUTH_VENDOR, AUTH_ID2);
const NAME = 'name';
const IMG = '/some/path';
const PSN_ID = 'ME';
const USER = new User(USER_ID, NAME, IMG, PSN_ID);
const USER2 = new User(USER_ID2, NAME, IMG, PSN_ID);
const CHANGED_NAME = 'name2';
const CHANGED_IMG = '/other/path';
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
const USER_DELETE_FAIL_DTO = new UserDeleteResponseDTO(true, 0);

describe('Users controller', () => {
  let app: NestApplication;
  let userModel: Model<UserDocument>;
  let journeyModel: Model<JourneyDocument>;
  let path: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            return { uri: process.env['MONGO_URI'] };
          },
        }),
        UserModule,
        JourneyModule,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: USER_ID };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication({
      logger: new ConsoleLogger(),
    });
    // TODO: 인터셉터와 익셉션 필터 제대로 적용된 뒤에 app에 인터셉터, 익셉션 필터, 파이프 적용 및 테스트 케이스 추가
    await app.init();
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    journeyModel = module.get<Model<JourneyDocument>>(
      getModelToken(Journey.name),
    );
  });

  describe('GET /users/me', () => {
    it('success', async () => {
      const user = new userModel(USER);
      await user.save();

      const response = await request(app.getHttpServer())
        .get(`/users/me`)
        .type('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: USER_ID,
        name: NAME,
        profileImagePath: IMG,
        personality: PERSONALITY[PSN_ID],
      });
    });

    it('해당 유저가 존재하지 않아 404 응답', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/me`)
        .type('application/json');
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /users/:id', () => {
    it('success', async () => {
      const user = new userModel(USER);
      await user.save();

      const response = await request(app.getHttpServer())
        .get(`/users/${USER_ID}`)
        .type('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: USER_ID,
        name: NAME,
        profileImagePath: IMG,
        personality: PERSONALITY[PSN_ID],
      });
    });

    it('해당 유저가 존재하지 않아 404 응답', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${USER_ID}`)
        .type('application/json');
      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /users', () => {
    it('POST /users', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: NAME,
          profileImagePath: IMG,
          personalityId: PSN_ID,
        })
        .type('application/json');
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        id: USER_ID,
        name: NAME,
        profileImagePath: IMG,
        personality: PERSONALITY[PSN_ID],
      });
      const user = await userModel.findById({ _id: USER_ID }).exec();
      expect(user._id).toBe(USER_ID);
      expect(user.name).toBe(NAME);
      expect(user.img).toBe(IMG);
      expect(user.psn).toBe(PSN_ID);
    });
  });

  describe('PATCH /users/:id', () => {
    it('PATCH /users/:id', async () => {
      const user = new userModel(USER);
      await user.save();

      const response = await request(app.getHttpServer())
        .patch(`/users/${USER_ID}`)
        .send({
          name: CHANGED_NAME,
          profileImagePath: CHANGED_IMG,
        })
        .type('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: USER_ID,
        name: CHANGED_NAME,
        profileImagePath: CHANGED_IMG,
        personality: PERSONALITY[PSN_ID],
      });
      const updatedUser = await userModel.findById({ _id: USER_ID }).exec();
      expect(updatedUser._id).toBe(USER_ID);
      expect(updatedUser.name).toBe(CHANGED_NAME);
      expect(updatedUser.img).toBe(CHANGED_IMG);
      expect(updatedUser.psn).toBe(PSN_ID);
    });
  });

  describe('DELETE /users/:id', () => {
    let journeyIds: string[];

    beforeEach(async () => {
      // given
      const user = new userModel(USER);
      await user.save();
      journeyIds = [];
      for (let i = 0; i < 3; i++) {
        const journey = new journeyModel(JOURNEY);
        await journey.save();
        journeyIds.push(journey._id.toString());
      }
      path = `/users/${USER_ID}`;
    });

    it('success', async () => {
      // when
      const response = await request(app.getHttpServer()).delete(path);

      // then
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        acknowledged: true,
        deletedCount: 1,
      });
      for (const journeyId of journeyIds) {
        const updatedJourney = await journeyModel.findById(journeyId).exec();
        expect(
          updatedJourney.users.map((user) => user._id).indexOf(USER_ID),
        ).toEqual(-1);
      }
      const deletedUser = await userModel.findById(USER_ID).exec();
      expect(deletedUser).toBeNull();
    });

    it('유저가 존재하지 않을 때 400 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer()).delete(path);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('저니에서 유저 데이터 삭제 중 에러 발생 시 모든 데이터 삭제 중단, 500 응답', async () => {
      // given
      const originalFn = JourneyService.prototype.deleteUserFromJourney;
      JourneyService.prototype.deleteUserFromJourney = () => {
        throw new Error();
      };

      // when
      const response = await request(app.getHttpServer()).delete(path);

      // then
      expect(response.statusCode).toBe(500);
      for (const journeyId of journeyIds) {
        const updatedJourney = await journeyModel.findById(journeyId).exec();
        expect(
          (updatedJourney.users as unknown as string[]).indexOf(USER_ID),
        ).not.toEqual(-1);
      }
      const user = await userModel.findById(USER_ID).exec();
      expect(user).not.toBeNull();

      // finally
      JourneyService.prototype.deleteUserFromJourney = originalFn;
    });

    it('DB에서 삭제가 일어나지 않았을 경우 500 응답', async () => {
      // given
      const originalFn = UserRepository.prototype.deleteOne;
      UserRepository.prototype.deleteOne = async () => USER_DELETE_FAIL_DTO;

      // when
      const response = await request(app.getHttpServer()).delete(path);

      // then
      expect(response.statusCode).toBe(500);

      // finally
      UserRepository.prototype.deleteOne = originalFn;
    });
  });

  afterEach(async () => {
    await userModel.deleteMany({});
    await journeyModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });
});

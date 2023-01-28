import { NestApplication } from '@nestjs/core';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from '../src/user/schemas/user.schema';
import { UserModule } from '../src/user/user.module';
import request from 'supertest';
import { ConsoleLogger, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PERSONALITY } from '../src/user/schemas/personality';
import { AuthVendor } from '../src/auth/authVendor';
import { generateId } from '../src/common/util';

const AUTH_VENDOR = AuthVendor.KAKAO;
const AUTH_ID = '1234';
const ID = generateId(AUTH_VENDOR, AUTH_ID);
const NAME = 'name';
const IMG = '/some/path';
const PSN_ID = 'ME';
const USER = new User(ID, NAME, IMG, PSN_ID);
const CHANGED_NAME = 'name2';
const CHANGED_IMG = '/other/path';

describe('Users controller', () => {
  let app: NestApplication;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            return { uri: process.env['MONGO_URI'] };
          },
        }),
        UserModule,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: ID };
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
        id: ID,
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
        .get(`/users/${ID}`)
        .type('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: ID,
        name: NAME,
        profileImagePath: IMG,
        personality: PERSONALITY[PSN_ID],
      });
    });

    it('해당 유저가 존재하지 않아 404 응답', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${ID}`)
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
        id: ID,
        name: NAME,
        profileImagePath: IMG,
        personality: PERSONALITY[PSN_ID],
      });
      const user = await userModel.findById({ _id: ID }).exec();
      expect(user._id).toBe(ID);
      expect(user.name).toBe(NAME);
      expect(user.img).toBe(IMG);
      expect(user.psn).toBe(PSN_ID);
    });
  });

  describe('DELETE /users/:id', () => {
    it('DELETE /users/:id', async () => {
      const user = new userModel(USER);
      await user.save();

      const response = await request(app.getHttpServer())
        .delete(`/users/${ID}`)
        .type('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        acknowledged: true,
        deletedCount: 1,
      });
      const deletedUser = await userModel.findById(ID).exec();
      expect(deletedUser).toBeNull();
    });
  });

  describe('PATCH /users/:id', () => {
    it('PATCH /users/:id', async () => {
      const user = new userModel(USER);
      await user.save();

      const response = await request(app.getHttpServer())
        .patch(`/users/${ID}`)
        .send({
          name: CHANGED_NAME,
          profileImagePath: CHANGED_IMG,
        })
        .type('application/json');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: ID,
        name: CHANGED_NAME,
        profileImagePath: CHANGED_IMG,
        personality: PERSONALITY[PSN_ID],
      });
      const updatedUser = await userModel.findById({ _id: ID }).exec();
      expect(updatedUser._id).toBe(ID);
      expect(updatedUser.name).toBe(CHANGED_NAME);
      expect(updatedUser.img).toBe(CHANGED_IMG);
      expect(updatedUser.psn).toBe(PSN_ID);
    });
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });
});

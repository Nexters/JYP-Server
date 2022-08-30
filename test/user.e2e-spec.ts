import { NestApplication } from '@nestjs/core';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/user/schemas/user.schema';
import { UserModule } from '../src/user/user.module';
import request from 'supertest';
import { ConsoleLogger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PERSONALITY } from '../src/user/schemas/personality';
import { AuthVendor } from '../src/auth/authVendor';
import { generateId } from '../src/common/util';

const AUTH_VENDOR = AuthVendor.KAKAO;
const AUTH_ID = '1234';
const ID = generateId(AUTH_VENDOR, AUTH_ID);
const NAME = 'name';
const IMG = '/some/path';
const PSN = 'ME';
const CHANGED_NAME = 'name2';
const CHANGED_IMG = '/other/path';

describe('Users controller', () => {
  let mongoServer: MongoMemoryServer;
  let app: NestApplication;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instance: { dbName: 'jyp' },
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => {
            return { uri: mongoServer.getUri() };
          },
        }),
        UserModule,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication({
      logger: new ConsoleLogger(),
    });
    // TODO: 인터셉터와 익셉션 필터 제대로 적용된 뒤에 app에 인터셉터, 익셉션 필터, 파이프 적용 및 테스트 케이스 추가
    await app.init();
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('GET /users/:id', async () => {
    const user = new userModel({ _id: ID, name: NAME, img: IMG, psn: PSN });
    await user.save();

    return request(app.getHttpServer())
      .get(`/users/${ID}`)
      .type('application/json')
      .expect(200)
      .expect({
        id: ID,
        name: NAME,
        profileImagePath: IMG,
        personality: PERSONALITY[PSN],
      });
  });

  it('GET /users/:id and get 404', async () => {
    return request(app.getHttpServer())
      .get(`/users/${ID}`)
      .type('application/json')
      .expect(404);
  });

  it('POST /users', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        authVendor: AUTH_VENDOR,
        authId: AUTH_ID,
        name: NAME,
        profileImagePath: IMG,
        personalityId: PSN,
      })
      .type('application/json')
      .expect(201)
      .expect(async (res) => {
        expect(res.body).toEqual({
          id: ID,
          name: NAME,
          profileImagePath: IMG,
          personality: PERSONALITY[PSN],
        });
        const user = await userModel.findById({ _id: ID }).exec();
        expect(user._id).toBe(ID);
        expect(user.name).toBe(NAME);
        expect(user.img).toBe(IMG);
        expect(user.psn).toBe(PSN);
      });
  });

  it('PATCH /users/:id', async () => {
    const user = new userModel({ _id: ID, name: NAME, img: IMG, psn: PSN });
    await user.save();

    return request(app.getHttpServer())
      .patch(`/users/${ID}`)
      .send({
        name: CHANGED_NAME,
        profileImagePath: CHANGED_IMG,
      })
      .type('application/json')
      .expect(200)
      .expect(async (res) => {
        expect(res.body).toEqual({
          id: ID,
          name: CHANGED_NAME,
          profileImagePath: CHANGED_IMG,
          personality: PERSONALITY[PSN],
        });
        const user = await userModel.findById({ _id: ID }).exec();
        expect(user._id).toBe(ID);
        expect(user.name).toBe(CHANGED_NAME);
        expect(user.img).toBe(CHANGED_IMG);
        expect(user.psn).toBe(PSN);
      });
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    app.close();
    mongoServer.stop();
  });
});

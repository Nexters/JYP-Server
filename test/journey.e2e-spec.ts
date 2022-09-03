import { ConsoleLogger, ExecutionContext } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { JourneyModule } from '../src/journey/journey.module';
import {
  Tag,
  Journey,
  JourneyDocument,
} from '../src/journey/schemas/journey.schema';
import { User, UserDocument } from '../src/user/schemas/user.schema';
import { UserModule } from '../src/user/user.module';
import request from 'supertest';
import { MAX_JOURNEY_PER_USER } from '../src/common/validation/validation.constants';
import { toPlainObject } from '../src/common/util';

jest.mock('../src/common/validation/validation.constants', () => ({
  MAX_JOURNEY_PER_USER: 5,
}));

const JOURNEY_NAME = 'name';
const START_DATE = 1661299200;
const END_DATE = 1661558400; // 3일 차이
const THEME_PATH = 'path';
const FIRST_TOPIC = 'topic1';
const FIRST_ORIENT = 'like';
const SECOND_TOPIC = 'topic2';
const SECOND_ORIENT = 'dislike';
const USER_ID = 'kakao-1234';
const USER_NAME = 'username';
const USER_IMG = '/user/img';
const USER_PSN = 'ME';
const USER = new User(USER_ID, USER_NAME, USER_IMG, USER_PSN);
const TAGS = [
  new Tag(FIRST_TOPIC, FIRST_ORIENT, [USER]),
  new Tag(SECOND_TOPIC, SECOND_ORIENT, [USER]),
];
const JOURNEY = new Journey(
  JOURNEY_NAME,
  START_DATE,
  END_DATE,
  THEME_PATH,
  [USER],
  TAGS,
  [],
  [[], [], []],
) as JourneyDocument;
const SAVED_JOURNEY = structuredClone(JOURNEY);
const JOURNEY_ID = '630b28c08abfc3f96130789c';
SAVED_JOURNEY._id = new mongoose.Types.ObjectId(JOURNEY_ID);

describe('Journeys controller', () => {
  let app: NestApplication;
  let userModel: Model<UserDocument>;
  let journeyModel: Model<JourneyDocument>;

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
    await app.init();
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    journeyModel = module.get<Model<JourneyDocument>>(
      getModelToken(Journey.name),
    );
  });

  describe('POST /journeys', () => {
    it('success', async () => {
      const user = new userModel(USER);
      await user.save();
      const response = await request(app.getHttpServer())
        .post('/journeys')
        .send({
          name: JOURNEY_NAME,
          startDate: START_DATE,
          endDate: END_DATE,
          themePath: THEME_PATH,
          tags: [
            {
              topic: FIRST_TOPIC,
              orientation: FIRST_ORIENT,
            },
            {
              topic: SECOND_TOPIC,
              orientation: SECOND_ORIENT,
            },
          ],
        })
        .type('application/json');
      expect(response.statusCode).toBe(201);
      const journeyId = response.body.id;
      const journeyDoc = await journeyModel
        .findById({ _id: journeyId })
        .populate({
          path: 'tags',
          populate: { path: 'users' },
        })
        .populate('users')
        .exec();
      const journey = toPlainObject(journeyDoc, JOURNEY);
      expect(journey).toEqual(JOURNEY);
    });

    it('최대 여행 갯수 초과로 400 응답', async () => {
      const user = new userModel(USER);
      await user.save();
      for (const _ of Array(MAX_JOURNEY_PER_USER).keys()) {
        const existingJourney = new journeyModel(JOURNEY);
        existingJourney.save();
      }
      const response = await request(app.getHttpServer())
        .post('/journeys')
        .send({
          name: JOURNEY_NAME,
          startDate: START_DATE,
          endDate: END_DATE,
          themePath: THEME_PATH,
          tags: [
            {
              topic: FIRST_TOPIC,
              orientation: FIRST_ORIENT,
            },
            {
              topic: SECOND_TOPIC,
              orientation: SECOND_ORIENT,
            },
          ],
        })
        .type('application/json');
      expect(response.statusCode).toBe(400);
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      const response = await request(app.getHttpServer())
        .post('/journeys')
        .send({
          name: JOURNEY_NAME,
          startDate: START_DATE,
          endDate: END_DATE,
          themePath: THEME_PATH,
          tags: [
            {
              topic: FIRST_TOPIC,
              orientation: FIRST_ORIENT,
            },
            {
              topic: SECOND_TOPIC,
              orientation: SECOND_ORIENT,
            },
          ],
        })
        .type('application/json');
      expect(response.statusCode).toBe(401);
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

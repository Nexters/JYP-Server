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
  Pikmi,
} from '../src/journey/schemas/journey.schema';
import { User, UserDocument } from '../src/user/schemas/user.schema';
import { UserModule } from '../src/user/user.module';
import request from 'supertest';
import {
  MAX_JOURNEY_PER_USER,
  MAX_PIKMI_PER_JOURNEY,
} from '../src/common/validation/validation.constants';
import { toPlainObject } from '../src/common/util';

jest.mock('../src/common/validation/validation.constants', () => ({
  MAX_JOURNEY_PER_USER: 5,
  MAX_PIKMI_PER_JOURNEY: 5,
  MAX_USER_PER_JOURNEY: 2,
}));

const CONTENT_TYPE = 'application/json';
const JOURNEY_NAME = 'name';
const START_DATE = 1661299200;
const END_DATE = 1661558400; // 3일 차이
const THEME_PATH = 'path';
const FIRST_TOPIC = 'topic1';
const FIRST_ORIENT = 'like';
const SECOND_TOPIC = 'topic2';
const SECOND_ORIENT = 'dislike';
const THIRD_TOPIC = 'topic3';
const THIRD_ORIENT = 'nomatter';
const FOURTH_TOPIC = 'topic4';
const FOURTH_ORIENT = 'like';
const USER_ID = 'kakao-1234';
const USER_NAME = 'username';
const USER_IMG = '/user/img';
const USER_PSN = 'ME';
const USER = new User(USER_ID, USER_NAME, USER_IMG, USER_PSN);
const TAGS = [
  new Tag(FIRST_TOPIC, FIRST_ORIENT, USER),
  new Tag(SECOND_TOPIC, SECOND_ORIENT, USER),
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
);
const SAVED_JOURNEY = structuredClone(JOURNEY);
const JOURNEY_ID = '630b28c08abfc3f96130789c';
SAVED_JOURNEY._id = new mongoose.Types.ObjectId(JOURNEY_ID);
const PIKMI1_ID = '63136a1e02efbf949b847f8e';
const PIKMI2_ID = '63136a1e02efbf949b847f8f';
const PIKMI3_ID = '63136a1e02efbf949b847f90';
const PIKMI_NAME = 'pikmi';
const PIKMI_ADDR = 'pikmi addr';
const PIKMI_CATEGORY = 'P';
const PIKMI_LON = 129.4;
const PIKMI_LAT = 36.7;
const PIKMI_LINK = '/pikmi/link';
const PIKI_INDEX = 0;
const PIKI1_ID = '63136a1e02efbf949b847f8c';
const PIKI1_NAME = 'piki1';
const PIKI1_ADDR = 'piki1 addr';
const PIKI1_CATEGORY = 'T';
const PIKI1_LON = 130.4;
const PIKI1_LAT = 37.7;
const PIKI1_LINK = '/piki2/link';
const PIKI2_ID = '63136a1e02efbf949b847f8d';
const PIKI2_NAME = 'piki2';
const PIKI2_ADDR = 'piki2 addr';
const PIKI2_CATEGORY = 'S';
const PIKI2_LON = 131.4;
const PIKI2_LAT = 38.7;
const PIKI2_LINK = '/piki2/link';
const USER2 = new User('user2', 'name2', 'img2', 'ME');
const USER3 = new User('user3', 'name3', 'img3', 'ME');

describe('Journeys controller', () => {
  let app: NestApplication;
  let userModel: Model<UserDocument>;
  let journeyModel: Model<JourneyDocument>;
  let journey: JourneyDocument;
  let journeyId: string;
  let path: string;
  let body: object;

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
    beforeEach(async () => {
      // given
      const user = new userModel(USER);
      await user.save();
      path = '/journeys';
      body = {
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
      };
    });

    it('success', async () => {
      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(201);
      const journeyId = response.body.id;
      const journeyDoc = await journeyModel
        .findById({ _id: journeyId })
        .populate({
          path: 'tags',
          populate: { path: 'user' },
        })
        .populate('users')
        .exec();
      const journey = toPlainObject(journeyDoc, JOURNEY);
      expect(journey).toEqual(JOURNEY);
    });

    it('최대 여행 갯수 초과로 400 응답', async () => {
      // given
      for (const _ of Array(MAX_JOURNEY_PER_USER).keys()) {
        const existingJourney = new journeyModel(JOURNEY);
        existingJourney.save();
      }

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST journeys/:journeyId/pikmis', () => {
    beforeEach(async () => {
      // given
      journey = new journeyModel(JOURNEY);
      journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      path = `/journeys/${journeyId}/pikmis`;
      body = {
        name: PIKMI_NAME,
        address: PIKMI_ADDR,
        category: PIKMI_CATEGORY,
        longitude: PIKMI_LON,
        latitude: PIKMI_LAT,
        link: PIKMI_LINK,
      };
    });

    it('success', async () => {
      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(201);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate({
          path: 'pikmis',
          populate: { path: 'likeBy' },
        })
        .exec();
      expect(updatedJourney.pikmis.length).toBe(journey.pikmis.length + 1);
      const createdPikmi =
        updatedJourney.pikmis[updatedJourney.pikmis.length - 1];
      expect(createdPikmi._id.toString()).toBe(response.body.id);
      expect(createdPikmi.name).toBe(PIKMI_NAME);
      expect(createdPikmi.addr).toBe(PIKMI_ADDR);
      expect(createdPikmi.cate).toBe(PIKMI_CATEGORY);
      expect(Array.isArray(createdPikmi.likeBy)).toBe(true);
      expect(createdPikmi.likeBy.length).toBe(0);
      expect(createdPikmi.lon).toBe(PIKMI_LON);
      expect(createdPikmi.lat).toBe(PIKMI_LAT);
      expect(createdPikmi.link).toBe(PIKMI_LINK);
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndDelete(journeyId);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      // given
      await journeyModel.findByIdAndUpdate(journeyId, {
        $pull: { users: USER_ID },
      });

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('저니에 픽미 갯수가 MAX_PIKMI_PER_JOURNEY를 초과했을 때 400 응답', async () => {
      // given
      for (const _ of Array(MAX_PIKMI_PER_JOURNEY).keys()) {
        const pikmi = Pikmi.create(
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        );
        journey.pikmis.push(pikmi);
      }
      await journey.save();

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /journeys/:journeyId/pikis', () => {
    beforeEach(async () => {
      // given
      journey = new journeyModel(JOURNEY);
      journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      path = `/journeys/${journeyId}/pikis`;
      body = {
        index: PIKI_INDEX,
        pikis: [
          {
            id: PIKI1_ID,
            name: PIKI1_NAME,
            address: PIKI1_ADDR,
            category: PIKI1_CATEGORY,
            longitude: PIKI1_LON,
            latitude: PIKI1_LAT,
            link: PIKI1_LINK,
          },
          {
            id: PIKI2_ID,
            name: PIKI2_NAME,
            address: PIKI2_ADDR,
            category: PIKI2_CATEGORY,
            longitude: PIKI2_LON,
            latitude: PIKI2_LAT,
            link: PIKI2_LINK,
          },
        ],
      };
    });

    it('success, piki ID X', async () => {
      // given
      body['pikis'].forEach((piki) => delete piki.id);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('pikis')
        .exec();
      const updatedPikis = updatedJourney.pikis[PIKI_INDEX];
      expect(updatedPikis[0]._id.toString()).toBe(response.body.ids[0]);
      expect(updatedPikis[1]._id.toString()).toBe(response.body.ids[1]);
      expect(toPlainObject(updatedPikis, body['pikis'])).toMatchObject(
        body['pikis'],
      );
    });

    it('success, piki ID O', async () => {
      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('pikis')
        .exec();
      const updatedPikis = updatedJourney.pikis[PIKI_INDEX];
      expect(updatedPikis[0]._id.toString()).toBe(response.body.ids[0]);
      expect(updatedPikis[1]._id.toString()).toBe(response.body.ids[1]);
      expect(toPlainObject(updatedPikis, body['pikis'])).toMatchObject(
        body['pikis'],
      );
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndDelete(journeyId);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      // given
      await journeyModel.findByIdAndUpdate(journeyId, {
        $pull: { users: USER_ID },
      });

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('index가 범위를 벗어났을 때 400 응답', async () => {
      // given
      const invalidIndex = journey.pikis.length;
      body['index'] = invalidIndex;

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /journeys/:journeyId/tags', () => {
    beforeEach(async () => {
      // given
      const tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER),
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER2),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER3),
        new Tag(THIRD_TOPIC, THIRD_ORIENT, USER),
      ];
      journey = new journeyModel(
        new Journey(
          JOURNEY_NAME,
          START_DATE,
          END_DATE,
          THEME_PATH,
          [USER, USER2, USER3],
          tags,
          [],
          [[], [], []],
        ),
      );
      journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const user2 = new userModel(USER2);
      await user2.save();
      const user3 = new userModel(USER3);
      await user3.save();
      path = `/journeys/${journeyId}/tags`;
      body = {
        tags: [
          {
            topic: FIRST_TOPIC,
            orientation: FIRST_ORIENT,
          },
          {
            topic: SECOND_TOPIC,
            orientation: SECOND_ORIENT,
          },
          {
            topic: FOURTH_TOPIC,
            orientation: FOURTH_ORIENT,
          },
        ],
      };
    });

    it('success', async () => {
      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate({
          path: 'tags',
          populate: { path: 'user' },
        })
        .exec();
      const expectedTags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER2),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER3),
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER),
        new Tag(FOURTH_TOPIC, FOURTH_ORIENT, USER),
      ];
      const updatedTags = toPlainObject(updatedJourney.tags, expectedTags);
      expect(updatedTags).toEqual(expectedTags);
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndDelete(journeyId);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      // given
      await journeyModel.findByIdAndUpdate(journeyId, {
        $pull: { users: USER_ID },
      });

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /journeys/:journeyId/join', () => {
    beforeEach(async () => {
      // given
      const tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER2),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER2),
      ];
      journey = new journeyModel(
        new Journey(
          JOURNEY_NAME,
          START_DATE,
          END_DATE,
          THEME_PATH,
          [USER2],
          tags,
          [],
          [[], [], []],
        ),
      );
      journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const user2 = new userModel(USER2);
      await user2.save();
      path = `/journeys/${journeyId}/join`;
      body = {
        tags: [
          {
            topic: FIRST_TOPIC,
            orientation: FIRST_ORIENT,
          },
          {
            topic: SECOND_TOPIC,
            orientation: SECOND_ORIENT,
          },
          {
            topic: FOURTH_TOPIC,
            orientation: FOURTH_ORIENT,
          },
        ],
      };
    });

    it('success', async () => {
      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('users')
        .populate({
          path: 'tags',
          populate: { path: 'user' },
        })
        .exec();
      const expectedUsers = [USER2, USER];
      const expectedTags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER2),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER2),
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER),
        new Tag(FOURTH_TOPIC, FOURTH_ORIENT, USER),
      ];
      const updatedUsers = toPlainObject(updatedJourney.users, expectedUsers);
      const updatedTags = toPlainObject(updatedJourney.tags, expectedTags);
      expect(updatedUsers).toEqual(expectedUsers);
      expect(updatedTags).toEqual(expectedTags);
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndDelete(journeyId);

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('저니에 정원이 찼을 때 400 응답', async () => {
      // given
      journey.users.push(USER3);
      journey.save();

      // when
      const response = await request(app.getHttpServer())
        .post(path)
        .send(body)
        .type(CONTENT_TYPE);

      // then
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /journeys/:journeyId/drop', () => {
    let tags: Tag[];
    let pikmis: Pikmi[];

    beforeEach(async () => {
      // given
      tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER2),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER2),
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER),
        new Tag(FOURTH_TOPIC, FOURTH_ORIENT, USER),
      ];
      const pikmiId1 = '63136a1e02efbf949b847f8c';
      const pikmiId2 = '63136a1e02efbf949b847f8d';
      pikmis = [
        new Pikmi(
          pikmiId1,
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER, USER2],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        ),
        new Pikmi(
          pikmiId2,
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER, USER2],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        ),
      ];
      journey = new journeyModel(
        new Journey(
          JOURNEY_NAME,
          START_DATE,
          END_DATE,
          THEME_PATH,
          [USER, USER2],
          tags,
          pikmis,
          [[], [], []],
        ),
      );
      journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const user2 = new userModel(USER2);
      await user2.save();
      path = `/journeys/${journeyId}/drop`;
    });

    it('success, 저니를 삭제하지 않는 경우', async () => {
      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('users')
        .populate({
          path: 'tags',
          populate: { path: 'user' },
        })
        .populate({
          path: 'pikmis',
          populate: { path: 'likeBy' },
        })
        .exec();
      const expectedTags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, USER2),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, USER2),
      ];
      const expectedPikmis = structuredClone(pikmis);
      expectedPikmis.forEach((pikmi) => (pikmi.likeBy = [USER2]));
      const expectedJourney = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        expectedTags,
        expectedPikmis,
        [[], [], []],
      );
      expect(toPlainObject(updatedJourney, expectedJourney)).toMatchObject(
        expectedJourney,
      );
    });

    it('success, 저니를 삭제하는 경우', async () => {
      // given
      journey.users = [USER];
      journey.save();

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .exec();
      expect(updatedJourney).toBeNull();
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndDelete(journeyId);

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      // given
      await journeyModel.findByIdAndUpdate(journeyId, {
        $pull: { users: USER_ID },
      });

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /journeys/:journeyId/pikmis/:pikmiId/likes', () => {
    let pikmis: Pikmi[];

    beforeEach(async () => {
      // given
      pikmis = [
        new Pikmi(
          PIKMI1_ID,
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER2],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        ),
        new Pikmi(
          PIKMI2_ID,
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER2],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        ),
        new Pikmi(
          PIKMI3_ID,
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        ),
      ];
      journey = new journeyModel(
        new Journey(
          JOURNEY_NAME,
          START_DATE,
          END_DATE,
          THEME_PATH,
          [USER, USER2],
          TAGS,
          pikmis,
          [[], [], []],
        ),
      );
      journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const user2 = new userModel(USER2);
      await user2.save();
      path = `/journeys/${journeyId}/pikmis/${PIKMI1_ID}/likes`;
    });

    it('success, 좋아요를 추가하는 경우', async () => {
      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('users')
        .populate({
          path: 'tags',
          populate: { path: 'user' },
        })
        .populate({
          path: 'pikmis',
          populate: { path: 'likeBy' },
        })
        .exec();
      const expectedPikmis = structuredClone(pikmis);
      expectedPikmis[0].likeBy.push(USER);
      const expectedJourney = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2],
        TAGS,
        expectedPikmis,
        [[], [], []],
      );
      expect(toPlainObject(updatedJourney, expectedJourney)).toMatchObject(
        expectedJourney,
      );
    });

    it('success, 좋아요를 추가하지 않는 경우', async () => {
      // given
      await journeyModel.updateOne(
        { _id: journeyId, 'pikmis._id': PIKMI1_ID },
        { $push: { 'pikmis.$.likeBy': USER } },
      );

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('users')
        .populate({
          path: 'tags',
          populate: { path: 'user' },
        })
        .populate({
          path: 'pikmis',
          populate: { path: 'likeBy' },
        })
        .exec();
      const expectedPikmis = structuredClone(pikmis);
      expectedPikmis[0].likeBy.push(USER);
      const expectedJourney = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2],
        TAGS,
        expectedPikmis,
        [[], [], []],
      );
      expect(toPlainObject(updatedJourney, expectedJourney)).toMatchObject(
        expectedJourney,
      );
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndDelete(journeyId);

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      // given
      await journeyModel.findByIdAndUpdate(journeyId, {
        $pull: { users: USER_ID },
      });

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('픽미가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndUpdate(journeyId, {
        $pull: { pikmis: { _id: new mongoose.Types.ObjectId(PIKMI1_ID) } },
      });

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /journeys/:journeyId/pikmis/:pikmiId/undoLikes', () => {
    let pikmis: Pikmi[];

    beforeEach(async () => {
      // given
      pikmis = [
        new Pikmi(
          PIKMI1_ID,
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER, USER2],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        ),
        new Pikmi(
          PIKMI2_ID,
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER2],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        ),
        new Pikmi(
          PIKMI3_ID,
          PIKMI_NAME,
          PIKMI_ADDR,
          PIKMI_CATEGORY,
          [USER],
          PIKMI_LON,
          PIKMI_LAT,
          PIKMI_LINK,
        ),
      ];
      journey = new journeyModel(
        new Journey(
          JOURNEY_NAME,
          START_DATE,
          END_DATE,
          THEME_PATH,
          [USER, USER2],
          TAGS,
          pikmis,
          [[], [], []],
        ),
      );
      journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const user2 = new userModel(USER2);
      await user2.save();
      path = `/journeys/${journeyId}/pikmis/${PIKMI1_ID}/undoLikes`;
    });

    it('success, 좋아요를 삭제하는 경우', async () => {
      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('users')
        .populate({
          path: 'tags',
          populate: { path: 'user' },
        })
        .populate({
          path: 'pikmis',
          populate: { path: 'likeBy' },
        })
        .exec();
      const expectedPikmis = structuredClone(pikmis);
      expectedPikmis[0].likeBy = [USER2];
      const expectedJourney = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2],
        TAGS,
        expectedPikmis,
        [[], [], []],
      );
      expect(toPlainObject(updatedJourney, expectedJourney)).toMatchObject(
        expectedJourney,
      );
    });

    it('success, 좋아요가 존재하지 않아 수정하지 않는 경우', async () => {
      // given
      await journeyModel.updateOne(
        { _id: journeyId, 'pikmis._id': PIKMI1_ID },
        { $pull: { 'pikmis.$.likeBy': USER } },
      );

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('users')
        .populate({
          path: 'tags',
          populate: { path: 'user' },
        })
        .populate({
          path: 'pikmis',
          populate: { path: 'likeBy' },
        })
        .exec();
      const expectedPikmis = structuredClone(pikmis);
      expectedPikmis[0].likeBy = [USER2];
      const expectedJourney = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2],
        TAGS,
        expectedPikmis,
        [[], [], []],
      );
      expect(toPlainObject(updatedJourney, expectedJourney)).toMatchObject(
        expectedJourney,
      );
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      // given
      await userModel.findByIdAndDelete(USER_ID);

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndDelete(journeyId);

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      // given
      await journeyModel.findByIdAndUpdate(journeyId, {
        $pull: { users: USER_ID },
      });

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(401);
    });

    it('픽미가 존재하지 않을 때 400 응답', async () => {
      // given
      await journeyModel.findByIdAndUpdate(journeyId, {
        $pull: { pikmis: { _id: new mongoose.Types.ObjectId(PIKMI1_ID) } },
      });

      // when
      const response = await request(app.getHttpServer()).post(path);

      // then
      expect(response.statusCode).toBe(400);
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

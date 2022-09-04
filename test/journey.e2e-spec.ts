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
}));

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
);
const SAVED_JOURNEY = structuredClone(JOURNEY);
const JOURNEY_ID = '630b28c08abfc3f96130789c';
SAVED_JOURNEY._id = new mongoose.Types.ObjectId(JOURNEY_ID);
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

  describe('POST journeys/:journeyId/pikmis', () => {
    it('success', async () => {
      const journey = new journeyModel(JOURNEY);
      const journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikmis`)
        .send({
          name: PIKMI_NAME,
          address: PIKMI_ADDR,
          category: PIKMI_CATEGORY,
          longitude: PIKMI_LON,
          latitude: PIKMI_LAT,
          link: PIKMI_LINK,
        })
        .type('application/json');
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
      const journey = new journeyModel(JOURNEY);
      const journeyId = journey._id.toString();
      await journey.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikmis`)
        .send({
          name: PIKMI_NAME,
          address: PIKMI_ADDR,
          category: PIKMI_CATEGORY,
          longitude: PIKMI_LON,
          latitude: PIKMI_LAT,
          link: PIKMI_LINK,
        })
        .type('application/json');
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      const user = new userModel(USER);
      await user.save();
      const nonExistingJourneyId = '630b28c08abfc3f96130789f';
      const response = await request(app.getHttpServer())
        .post(`/journeys/${nonExistingJourneyId}/pikmis`)
        .send({
          name: PIKMI_NAME,
          address: PIKMI_ADDR,
          category: PIKMI_CATEGORY,
          longitude: PIKMI_LON,
          latitude: PIKMI_LAT,
          link: PIKMI_LINK,
        })
        .type('application/json');
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      const journeyWithoutUser = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [],
        [[], [], []],
      );
      const journey = new journeyModel(journeyWithoutUser);
      const journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikmis`)
        .send({
          name: PIKMI_NAME,
          address: PIKMI_ADDR,
          category: PIKMI_CATEGORY,
          longitude: PIKMI_LON,
          latitude: PIKMI_LAT,
          link: PIKMI_LINK,
        })
        .type('application/json');
      expect(response.statusCode).toBe(401);
    });

    it('저니에 픽미 갯수가 MAX_PIKMI_PER_JOURNEY를 초과했을 때 400 응답', async () => {
      const journey = new journeyModel(JOURNEY);
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
      const journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikmis`)
        .send({
          name: PIKMI_NAME,
          address: PIKMI_ADDR,
          category: PIKMI_CATEGORY,
          longitude: PIKMI_LON,
          latitude: PIKMI_LAT,
          link: PIKMI_LINK,
        })
        .type('application/json');
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /journeys/:journeyId/pikis', () => {
    it('success, piki ID X', async () => {
      const journey = new journeyModel(JOURNEY);
      const journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikis`)
        .send({
          index: PIKI_INDEX,
          pikis: [
            {
              name: PIKI1_NAME,
              address: PIKI1_ADDR,
              category: PIKI1_CATEGORY,
              longitude: PIKI1_LON,
              latitude: PIKI1_LAT,
              link: PIKI1_LINK,
            },
            {
              name: PIKI2_NAME,
              address: PIKI2_ADDR,
              category: PIKI2_CATEGORY,
              longitude: PIKI2_LON,
              latitude: PIKI2_LAT,
              link: PIKI2_LINK,
            },
          ],
        })
        .type('application/json');
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('pikis')
        .exec();
      const updatedPikis = updatedJourney.pikis[PIKI_INDEX];
      expect(updatedPikis[0]._id.toString()).toBe(response.body.ids[0]);
      expect(updatedPikis[0].name).toBe(PIKI1_NAME);
      expect(updatedPikis[0].addr).toBe(PIKI1_ADDR);
      expect(updatedPikis[0].cate).toBe(PIKI1_CATEGORY);
      expect(updatedPikis[0].lon).toBe(PIKI1_LON);
      expect(updatedPikis[0].lat).toBe(PIKI1_LAT);
      expect(updatedPikis[0].link).toBe(PIKI1_LINK);
      expect(updatedPikis[1]._id.toString()).toBe(response.body.ids[1]);
      expect(updatedPikis[1].name).toBe(PIKI2_NAME);
      expect(updatedPikis[1].addr).toBe(PIKI2_ADDR);
      expect(updatedPikis[1].cate).toBe(PIKI2_CATEGORY);
      expect(updatedPikis[1].lon).toBe(PIKI2_LON);
      expect(updatedPikis[1].lat).toBe(PIKI2_LAT);
      expect(updatedPikis[1].link).toBe(PIKI2_LINK);
    });

    it('success, piki ID O', async () => {
      const journey = new journeyModel(JOURNEY);
      const journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikis`)
        .send({
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
        })
        .type('application/json');
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate('pikis')
        .exec();
      const updatedPikis = updatedJourney.pikis[PIKI_INDEX];
      expect(updatedPikis[0]._id.toString()).toBe(response.body.ids[0]);
      expect(updatedPikis[0]._id.toString()).toBe(PIKI1_ID);
      expect(updatedPikis[0].name).toBe(PIKI1_NAME);
      expect(updatedPikis[0].addr).toBe(PIKI1_ADDR);
      expect(updatedPikis[0].cate).toBe(PIKI1_CATEGORY);
      expect(updatedPikis[0].lon).toBe(PIKI1_LON);
      expect(updatedPikis[0].lat).toBe(PIKI1_LAT);
      expect(updatedPikis[0].link).toBe(PIKI1_LINK);
      expect(updatedPikis[1]._id.toString()).toBe(response.body.ids[1]);
      expect(updatedPikis[1]._id.toString()).toBe(PIKI2_ID);
      expect(updatedPikis[1].name).toBe(PIKI2_NAME);
      expect(updatedPikis[1].addr).toBe(PIKI2_ADDR);
      expect(updatedPikis[1].cate).toBe(PIKI2_CATEGORY);
      expect(updatedPikis[1].lon).toBe(PIKI2_LON);
      expect(updatedPikis[1].lat).toBe(PIKI2_LAT);
      expect(updatedPikis[1].link).toBe(PIKI2_LINK);
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      const journey = new journeyModel(JOURNEY);
      const journeyId = journey._id.toString();
      await journey.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikis`)
        .send({
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
        })
        .type('application/json');
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      const user = new userModel(USER);
      await user.save();
      const nonExistingJourneyId = '630b28c08abfc3f96130789f';
      const response = await request(app.getHttpServer())
        .post(`/journeys/${nonExistingJourneyId}/pikis`)
        .send({
          index: PIKI_INDEX,
          pikis: [
            {
              name: PIKI1_NAME,
              address: PIKI1_ADDR,
              category: PIKI1_CATEGORY,
              longitude: PIKI1_LON,
              latitude: PIKI1_LAT,
              link: PIKI1_LINK,
            },
            {
              name: PIKI2_NAME,
              address: PIKI2_ADDR,
              category: PIKI2_CATEGORY,
              longitude: PIKI2_LON,
              latitude: PIKI2_LAT,
              link: PIKI2_LINK,
            },
          ],
        })
        .type('application/json');
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      const journeyWithoutUser = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [],
        [[], [], []],
      );
      const journey = new journeyModel(journeyWithoutUser);
      const journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikis`)
        .send({
          index: PIKI_INDEX,
          pikis: [
            {
              name: PIKI1_NAME,
              address: PIKI1_ADDR,
              category: PIKI1_CATEGORY,
              longitude: PIKI1_LON,
              latitude: PIKI1_LAT,
              link: PIKI1_LINK,
            },
            {
              name: PIKI2_NAME,
              address: PIKI2_ADDR,
              category: PIKI2_CATEGORY,
              longitude: PIKI2_LON,
              latitude: PIKI2_LAT,
              link: PIKI2_LINK,
            },
          ],
        })
        .type('application/json');
      expect(response.statusCode).toBe(401);
    });

    it('index가 범위를 벗어났을 때 400 응답', async () => {
      const journey = new journeyModel(JOURNEY);
      const journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const invalidIndex = journey.pikis.length;
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/pikis`)
        .send({
          index: invalidIndex,
          pikis: [
            {
              name: PIKI1_NAME,
              address: PIKI1_ADDR,
              category: PIKI1_CATEGORY,
              longitude: PIKI1_LON,
              latitude: PIKI1_LAT,
              link: PIKI1_LINK,
            },
            {
              name: PIKI2_NAME,
              address: PIKI2_ADDR,
              category: PIKI2_CATEGORY,
              longitude: PIKI2_LON,
              latitude: PIKI2_LAT,
              link: PIKI2_LINK,
            },
          ],
        })
        .type('application/json');
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /journeys/:journeyId/tags', () => {
    it('success', async () => {
      const tags = [
        new Tag(FIRST_TOPIC, FIRST_ORIENT, [USER2]),
        new Tag(SECOND_TOPIC, SECOND_ORIENT, [USER3]),
        new Tag(THIRD_TOPIC, THIRD_ORIENT, [USER]),
      ];
      const journey = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER, USER2, USER3],
        tags,
        [],
        [[], [], []],
      );
      const journeyDoc = new journeyModel(journey);
      const journeyId = journeyDoc._id.toString();
      await journeyDoc.save();
      const user = new userModel(USER);
      await user.save();
      const user2 = new userModel(USER2);
      await user2.save();
      const user3 = new userModel(USER3);
      await user3.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/tags`)
        .send({
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
        })
        .type('application/json');
      expect(response.statusCode).toBe(200);
      const updatedJourney = await journeyModel
        .findById(new mongoose.Types.ObjectId(journeyId))
        .populate({
          path: 'tags',
          populate: { path: 'users' },
        })
        .exec();
      const updatedTags = updatedJourney.tags;
      expect(updatedTags.length).toBe(3);
      expect(updatedTags[0].users).toMatchObject([USER2, USER]);
      expect(updatedTags[1].users).toMatchObject([USER3, USER]);
      expect(updatedTags[2].topic).toBe(FOURTH_TOPIC);
      expect(updatedTags[2].orient).toBe(FOURTH_ORIENT);
      expect(updatedTags[2].users).toMatchObject([USER]);
    });

    it('payload로 전달된 회원 ID가 존재하지 않는 회원 ID일 때 401 응답', async () => {
      const journey = new journeyModel(JOURNEY);
      const journeyId = journey._id.toString();
      await journey.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/tags`)
        .send({
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
        })
        .type('application/json');
      expect(response.statusCode).toBe(401);
    });

    it('저니가 존재하지 않을 때 400 응답', async () => {
      const user = new userModel(USER);
      await user.save();
      const nonExistingJourneyId = '630b28c08abfc3f96130789f';
      const response = await request(app.getHttpServer())
        .post(`/journeys/${nonExistingJourneyId}/tags`)
        .send({
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
        })
        .type('application/json');
      expect(response.statusCode).toBe(400);
    });

    it('유저가 저니에 소속되어 있지 않을 때 401 응답', async () => {
      const journeyWithoutUser = new Journey(
        JOURNEY_NAME,
        START_DATE,
        END_DATE,
        THEME_PATH,
        [USER2],
        TAGS,
        [],
        [[], [], []],
      );
      const journey = new journeyModel(journeyWithoutUser);
      const journeyId = journey._id.toString();
      await journey.save();
      const user = new userModel(USER);
      await user.save();
      const response = await request(app.getHttpServer())
        .post(`/journeys/${journeyId}/tags`)
        .send({
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

const JYP_DB = 'jyp';
const JYP_USER = _getEnv('JYP_SERVER_USERNAME');
const JYP_PASSWORD = _getEnv('JYP_SERVER_PASSWORD');
const USERS_COLL = 'users';
const JOURNEYS_COLL = 'journeys';

const USERS_VALIDATOR = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['_id', 'name', 'img', 'psn'],
    properties: {
      _id: {
        bsonType: 'string',
      },
      name: {
        bsonType: 'string',
      },
      img: {
        bsonType: 'string',
      },
      psn: {
        bsonType: 'string',
      },
    },
  },
};

const JOURNEYS_VALIDATOR = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'start', 'end', 'theme', 'users', 'tags', 'pikmis', 'pikis'],
    properties: {
      name: {
        bsonType: 'string',
        maxLength: 10,
      },
      start: {
        bsonType: 'long',
      },
      end: {
        bsonType: 'long',
      },
      theme: {
        bsonType: 'string',
      },
      users: {
        bsonType: 'array',
        maxItems: 8,
        uniqueItems: true,
        items: {
          bsonType: 'string',
        },
      },
      tags: {
        bsonType: 'array',
        maxItems: 24,
        uniqueItems: true,
        items: {
          bsonType: 'object',
          required: ['topic', 'orient', 'users'],
          properties: {
            topic: {
              bsonType: 'string',
              maxLength: 6,
            },
            orient: {
              enum: ['like', 'dislike', 'nomatter'],
            },
            users: {
              bsonType: 'array',
              maxItems: 8,
              uniqueItems: true,
              items: {
                bsonType: 'string',
              },
            },
          },
        },
      },
      pikmis: {
        bsonType: 'array',
        maxItems: 100,
        items: {
          bsonType: 'object',
          required: ['_id', 'name', 'addr', 'cate', 'likeBy', 'lon', 'lat', 'link'],
          properties: {
            _id: {
              bsonType: 'objectId',
            },
            name: {
              bsonType: 'string',
            },
            addr: {
              bsonType: 'string',
            },
            cate: {
              enum: ['M', 'CS', 'S', 'T', 'CI', 'PI', 'TS', 'L', 'R', 'C', 'H', 'P', 'B', 'CZ', 'PL', 'ETC'],
            },
            likeBy: {
              bsonType: 'array',
              maxItems: 8,
              uniqueItems: true,
              items: {
                bsonType: 'string',
              },
            },
            lon: {
              bsonType: 'double',
              minimum: 124,
              maximum: 132,
            },
            lat: {
              bsonType: 'double',
              minimum: 33,
              maximum: 43,
            },
            link: {
              bsonType: 'string',
            },
          },
        },
      },
      pikis: {
        bsonType: 'array',
        maxItems: 366,
        items: {
          bsonType: 'array',
          maxItems: 50,
          uniqueItems: true,
          items: {
            bsonType: 'object',
            required: ['_id', 'name', 'addr', 'cate', 'lon', 'lat', 'link'],
            properties: {
              _id: {
                bsonType: 'objectId',
              },
              name: {
                bsonType: 'string',
              },
              addr: {
                bsonType: 'string',
              },
              cate: {
                enum: ['M', 'CS', 'S', 'T', 'CI', 'PI', 'TS', 'L', 'R', 'C', 'H', 'P', 'B', 'CZ', 'PL', 'ETC'],
              },
              lon: {
                bsonType: 'double',
                minimum: 124,
                maximum: 132,
              },
              lat: {
                bsonType: 'double',
                minimum: 33,
                maximum: 43,
              },
              link: {
                bsonType: 'string',
              },
            },
          },
        },
      },
    },
  },
};

db = db.getSiblingDB(JYP_DB);
db.createUser({
  user: JYP_USER,
  pwd: JYP_PASSWORD,
  roles: [
    {
      role: 'readWrite',
      db: JYP_DB,
    },
  ],
});
db.createCollection(USERS_COLL);
db.createCollection(JOURNEYS_COLL);

db.runCommand({
  collMod: USERS_COLL,
  validator: USERS_VALIDATOR,
  validationLevel: 'moderate',
});

db.runCommand({
  collMod: JOURNEYS_COLL,
  validator: JOURNEYS_VALIDATOR,
  validationLevel: 'moderate',
});

db.runCommand({
  createIndexes: JOURNEYS_COLL,
  indexes: [
    {
      key: {
        users: 1,
      },
      name: 'journey_users',
    },
  ],
});

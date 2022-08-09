const JYP_DB = 'jyp';
const JYP_USER = _getEnv('JYP_SERVER_USERNAME');
const JYP_PASSWORD = _getEnv('JYP_SERVER_PASSWORD');
const USERS_COLL = 'users';

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

db.runCommand({
  collMod: USERS_COLL,
  validator: USERS_VALIDATOR,
  validationLevel: 'moderate',
});

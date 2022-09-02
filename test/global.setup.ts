import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from './config';

export = async function globalSetup() {
  if (config.memory) {
    const instance = await MongoMemoryServer.create({
      instance: {
        port: config.port,
        ip: config.ip,
        dbName: config.database,
      },
    });
    const uri = instance.getUri();
    (global as any).__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  } else {
    process.env.MONGO_URI = `mongodb://${config.ip}:${config.port}`;
  }

  // The following is to make sure the database is clean before an test starts
  await mongoose.connect(`${process.env.MONGO_URI}/${config.database}`);
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};

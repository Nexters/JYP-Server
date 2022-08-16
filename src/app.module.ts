import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { APP_FILTER } from '@nestjs/core';
// import { ErrorFilter } from './http/http-exception.filter';
import { MongooseModule } from '@nestjs/mongoose';

const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_HOST = process.env.MONGO_HOST;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DB = process.env.MONGO_DB;

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`,
      { autoIndex: false, autoCreate: false },
    ),
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}

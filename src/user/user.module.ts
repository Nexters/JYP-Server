import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JourneyModule } from '../journey/journey.module';
import { JourneyRepository } from '../journey/journey.repository';
import { JourneyService } from '../journey/journey.service';
import { Journey, JourneySchema } from '../journey/schemas/journey.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    forwardRef(() => JourneyModule),
    MongooseModule.forFeature([
      { name: Journey.name, schema: JourneySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, JourneyService, JourneyRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}

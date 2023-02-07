import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { JourneyController } from './journey.controller';
import { JourneyRepository } from './journey.repository';
import { JourneyService } from './journey.service';
import { Journey, JourneySchema } from './schemas/journey.schema';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: Journey.name, schema: JourneySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [JourneyController],
  providers: [JourneyService, JourneyRepository, UserRepository],
  exports: [JourneyService, JourneyRepository],
})
export class JourneyModule {}

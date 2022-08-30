import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Journey, JourneyDocument } from './schemas/journey.schema';

@Injectable()
export class JourneyRepository {
  constructor(
    @InjectModel(Journey.name)
    private readonly journeyModel: Model<JourneyDocument>,
  ) {}

  public async listByUser(
    user: User,
    populate = true,
  ): Promise<JourneyDocument[]> {
    if (populate) {
      return this.journeyModel
        .find({ users: user })
        .populate('users')
        .populate('tags')
        .populate('pikmis')
        .populate('pikis')
        .exec();
    } else {
      return this.journeyModel.find({ users: user }).exec();
    }
  }

  public async insertOne(journey: JourneyDocument): Promise<JourneyDocument> {
    return journey.save();
  }
}

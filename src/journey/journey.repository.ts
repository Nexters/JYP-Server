import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Journey, JourneyDocument } from './schemas/journey.schema';

@Injectable()
export class JourneyRepository {
  constructor(
    @InjectModel(Journey.name)
    private readonly journeyModel: Model<JourneyDocument>,
  ) {}

  public async get(id: string, populate = true): Promise<JourneyDocument> {
    const objectId = new mongoose.Types.ObjectId(id);
    if (populate) {
      return this.journeyModel
        .findById(objectId)
        .populate('users')
        .populate({
          path: 'tags',
          populate: { path: 'users' },
        })
        .populate({
          path: 'pikmis',
          populate: { path: 'likeBy' },
        })
        .populate('pikis')
        .exec();
    } else {
      return this.journeyModel.findById(objectId).exec();
    }
  }

  public async listByUser(
    user: User,
    populate = true,
  ): Promise<JourneyDocument[]> {
    if (populate) {
      return this.journeyModel
        .find({ users: user })
        .populate('users')
        .populate({
          path: 'tags',
          populate: { path: 'users' },
        })
        .populate({
          path: 'pikmis',
          populate: { path: 'likeBy' },
        })
        .populate('pikis')
        .exec();
    } else {
      return this.journeyModel.find({ users: user }).exec();
    }
  }

  public async insert(journey: JourneyDocument): Promise<JourneyDocument> {
    return journey.save();
  }

  public async update(journey: JourneyDocument): Promise<JourneyDocument> {
    return journey.save();
  }
}

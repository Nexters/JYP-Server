import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Query } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Journey, JourneyDocument } from './schemas/journey.schema';

@Injectable()
export class JourneyRepository {
  constructor(
    @InjectModel(Journey.name)
    private readonly journeyModel: Model<JourneyDocument>,
  ) {}

  public async get(
    id: string,
    populateOptions: PopulateOptions = {},
  ): Promise<JourneyDocument> {
    const objectId = new mongoose.Types.ObjectId(id);
    let query: Query<any, any, any, any> = this.journeyModel.findById(objectId);
    if (populateOptions.populateUsers) {
      query = query.populate('users');
    }
    if (populateOptions.populateTags) {
      query = query.populate({
        path: 'tags',
        populate: { path: 'user' },
      });
    }
    if (populateOptions.populatePikmis) {
      query = query.populate({
        path: 'pikmis',
        populate: { path: 'likeBy' },
      });
    }
    if (populateOptions.populatePikis) {
      query = query.populate('pikis');
    }
    return await query.exec();
  }

  public async listByUser(
    user: User,
    populateOptions: PopulateOptions = {},
  ): Promise<JourneyDocument[]> {
    let query: Query<any, any, any, any> = this.journeyModel.find({
      users: user,
    });
    if (populateOptions.populateUsers) {
      query = query.populate('users');
    }
    if (populateOptions.populateTags) {
      query = query.populate({
        path: 'tags',
        populate: { path: 'user' },
      });
    }
    if (populateOptions.populatePikmis) {
      query = query.populate({
        path: 'pikmis',
        populate: { path: 'likeBy' },
      });
    }
    if (populateOptions.populatePikis) {
      query = query.populate('pikis');
    }
    return await query.exec();
  }

  public async insert(journey: JourneyDocument): Promise<JourneyDocument> {
    return await journey.save();
  }

  public async update(journey: JourneyDocument): Promise<JourneyDocument> {
    return await journey.save();
  }

  public async addLikeBy(journeyId: string, pikmiId: string, userId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    return await this.journeyModel.updateOne(
      { _id: journeyObjectId, 'pikmis._id': pikmiId },
      { $push: { 'pikmis.$.likeBy': userId } },
      { new: true },
    );
  }

  public async deleteLikeBy(
    journeyId: string,
    pikmiId: string,
    userId: string,
  ) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    return await this.journeyModel.updateOne(
      { _id: journeyObjectId, 'pikmis._id': pikmiId },
      { $pull: { 'pikmis.$.likeBy': userId } },
      { new: true },
    );
  }

  public async deleteTags(journeyId: string, userId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    return await this.journeyModel.findByIdAndUpdate(
      journeyObjectId,
      { $pull: { tags: { user: userId } } },
      { new: true },
    );
  }

  public async deleteUser(journeyId: string, userId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    return await this.journeyModel.findByIdAndUpdate(
      journeyObjectId,
      { $pull: { users: userId } },
      { new: true },
    );
  }

  public async deleteAllPikmiLikeBy(journeyId: string, userId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    return await this.journeyModel.findByIdAndUpdate(
      journeyObjectId,
      { $pull: { 'pikmis.$[].likeBy': userId } },
      { new: true },
    );
  }

  public async delete(journey: JourneyDocument) {
    return await this.journeyModel.deleteOne({ _id: journey._id });
  }
}

interface PopulateOptions {
  populateUsers?: boolean;
  populateTags?: boolean;
  populatePikmis?: boolean;
  populatePikis?: boolean;
}

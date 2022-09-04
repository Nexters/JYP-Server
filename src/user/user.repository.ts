import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async findOne(id: string): Promise<User> {
    return await this.userModel.findOne({ _id: id }).exec();
  }

  public async updateOne(
    id: string,
    name: string,
    profileImagePath: string,
  ): Promise<User> {
    return await this.userModel.findOneAndUpdate(
      { _id: id },
      { name: name, img: profileImagePath },
      { returnDocument: 'after' },
    );
  }

  public async insertOne(
    id: string,
    name: string,
    profileImagePath: string,
    personality: string,
  ): Promise<User> {
    const user = new this.userModel({
      _id: id,
      name: name,
      img: profileImagePath,
      psn: personality,
    });
    return await user.save();
  }
}

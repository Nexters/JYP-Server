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
    nickname: string,
    profileImagePath: string,
  ): Promise<User> {
    return await this.userModel.findOneAndUpdate(
      { _id: id },
      { name: nickname, img: profileImagePath },
      { returnDocument: 'after' },
    );
  }

  public async insertOne(
    id: string,
    nickname: string,
    profileImagePath: string,
    personality: string,
  ): Promise<User> {
    const user = new this.userModel({
      _id: id,
      name: nickname,
      img: profileImagePath,
      psn: personality,
    });
    return user.save();
  }
}

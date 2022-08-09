import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PERSONALITY } from './personality';

export type UserDocument = User & Document;

@Schema({ collection: 'users' })
export class User {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  img: string;

  @Prop({
    alias: 'personality',
    enum: Object.keys(PERSONALITY),
    required: true,
  })
  psn: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

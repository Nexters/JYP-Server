import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import mongooseLong from 'mongoose-long';
import { CATEGORY } from './category';
import { User } from '../../user/schemas/user.schema';
import { ORIENTATION } from './orientation';
import { generateSchemaWithoutId } from '../../common/util';

mongooseLong(mongoose);
export type JourneyDocument = Journey & Document<mongoose.Types.ObjectId>;

const toLong = (n: number) => mongoose.Types.Long.fromNumber(n);
const fromLong = (l: mongoose.Types.Long) => Number(l.toString());

@Schema()
export class Tag {
  @Prop({ required: true })
  topic: string;

  @Prop({
    alias: 'orientation',
    enum: Object.values(ORIENTATION),
    required: true,
  })
  orient: string;

  @Prop({
    type: [String],
    ref: 'User',
    required: true,
  })
  users: User[];

  constructor(topic: string, orient: string, users: User[]) {
    this.topic = topic;
    this.orient = orient;
    this.users = users;
  }
}
export const TagSchema = generateSchemaWithoutId(Tag);

@Schema()
export class Pikmi {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({
    alias: 'address',
    required: true,
  })
  addr: string;

  @Prop({
    alias: 'category',
    enum: Object.keys(CATEGORY),
    required: true,
  })
  cate: string;

  @Prop({
    type: [String],
    ref: 'User',
    required: true,
  })
  likeBy: User[];

  @Prop({
    type: mongoose.Schema.Types.Number,
    alias: 'longitude',
    required: true,
  })
  lon: number;

  @Prop({
    type: mongoose.Schema.Types.Number,
    alias: 'latitude',
    required: true,
  })
  lat: number;

  @Prop({ required: true })
  link: string;

  constructor(
    id: string,
    name: string,
    addr: string,
    cate: string,
    likeBy: User[],
    lon: number,
    lat: number,
    link: string,
  ) {
    this._id = new mongoose.Types.ObjectId(id);
    this.name = name;
    this.addr = addr;
    this.cate = cate;
    this.likeBy = likeBy;
    this.lon = lon;
    this.lat = lat;
    this.link = link;
  }

  public static create(
    name: string,
    addr: string,
    cate: string,
    likeBy: User[],
    lon: number,
    lat: number,
    link: string,
  ): Pikmi {
    const _id = new mongoose.Types.ObjectId();
    return new Pikmi(_id.toString(), name, addr, cate, likeBy, lon, lat, link);
  }
}
export const PikmiSchema = SchemaFactory.createForClass(Pikmi);

@Schema()
export class Piki {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({
    alias: 'address',
    required: true,
  })
  addr: string;

  @Prop({
    alias: 'category',
    enum: Object.keys(CATEGORY),
    required: true,
  })
  cate: string;

  @Prop({
    type: mongoose.Schema.Types.Number,
    alias: 'longitude',
    required: true,
  })
  lon: number;

  @Prop({
    type: mongoose.Schema.Types.Number,
    alias: 'latitude',
    required: true,
  })
  lat: number;

  @Prop({ required: true })
  link: string;

  constructor(
    id: string,
    name: string,
    addr: string,
    cate: string,
    lon: number,
    lat: number,
    link: string,
  ) {
    this._id = new mongoose.Types.ObjectId(id);
    this.name = name;
    this.addr = addr;
    this.cate = cate;
    this.lon = lon;
    this.lat = lat;
    this.link = link;
  }

  public static create(
    name: string,
    addr: string,
    cate: string,
    lon: number,
    lat: number,
    link: string,
  ): Piki {
    const _id = new mongoose.Types.ObjectId();
    return new Piki(_id.toString(), name, addr, cate, lon, lat, link);
  }
}
export const PikiSchema = SchemaFactory.createForClass(Piki);

@Schema({ collection: 'journeys' })
export class Journey {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.Long,
    alias: 'startDate',
    required: true,
    set: toLong,
    get: fromLong,
  })
  start: number;

  @Prop({
    type: mongoose.Schema.Types.Long,
    alias: 'endDate',
    required: true,
    set: toLong,
    get: fromLong,
  })
  end: number;

  @Prop({
    alias: 'themePath',
    required: true,
  })
  theme: string;

  @Prop({
    type: [String],
    ref: 'User',
    required: true,
  })
  users: User[];

  @Prop({
    type: [TagSchema],
    default: [],
  })
  tags: Tag[];

  @Prop({
    type: [PikmiSchema],
    default: [],
  })
  pikmis: Pikmi[];

  @Prop({
    type: [[PikiSchema]],
    default: [],
  })
  pikis: Piki[][];

  constructor(
    name: string,
    start: number,
    end: number,
    theme: string,
    users: User[],
    tags: Tag[],
    pikmis: Pikmi[],
    pikis: Piki[][],
  ) {
    this.name = name;
    this.start = start;
    this.end = end;
    this.theme = theme;
    this.users = users;
    this.tags = tags;
    this.pikmis = pikmis;
    this.pikis = pikis;
  }
}
export const JourneySchema = SchemaFactory.createForClass(Journey);

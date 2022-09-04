import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  MAX_JOURNEY_NAME_LENGTH,
  MAX_LATITUDE,
  MAX_LONGITUDE,
  MAX_PIKI_PER_DAY,
  MAX_TAGS,
  MAX_TAG_TOPIC_LENGTH,
  MIN_LATITUDE,
  MIN_LONGITUDE,
} from '../../common/validation/validation.constants';
import {
  INDEX_NEGATIVE_MSG,
  INDEX_NOT_INT_MSG,
  IS_IN_MSG,
  IS_NOT_EMPTY_KIND_MSG,
  IS_NOT_EMPTY_MSG,
  JOURNEY_NAME_LENGTH_EXCEEDED_MSG,
  LATITUDE_INVALID_MSG,
  LONGITUDE_INVALID_MSG,
  PIKI_EXCEEDED_MSG,
  TAG_EXCEEDED_MSG,
  TAG_TOPIC_LENGTH_EXCEEDED_MSG,
} from '../../common/validation/validation.messages';
import { CATEGORY } from '../schemas/category';
import { ORIENTATION } from '../schemas/orientation';
import {
  IdResponse,
  IdsResponse,
  JourneyCreate,
  PikisUpdate,
  PikiUpdate,
  PikmiCreate,
  TagCreate,
} from './journey.interface';

export class TagCreateDTO implements TagCreate {
  @ApiProperty({ description: '태그 주제' })
  @MaxLength(MAX_TAG_TOPIC_LENGTH, { message: TAG_TOPIC_LENGTH_EXCEEDED_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_KIND_MSG('태그 이름') })
  readonly topic: string;

  @ApiProperty({ description: '태그 성향' })
  @IsIn(Object.values(ORIENTATION), { message: IS_IN_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly orientation: string;

  constructor(topic: string, orientation: string) {
    this.topic = topic;
    this.orientation = orientation;
  }
}

export class JourneyCreateDTO implements JourneyCreate {
  @ApiProperty({ description: '여행 이름' })
  @MaxLength(MAX_JOURNEY_NAME_LENGTH, {
    message: JOURNEY_NAME_LENGTH_EXCEEDED_MSG,
  })
  @IsNotEmpty({ message: IS_NOT_EMPTY_KIND_MSG('여행 이름') })
  readonly name: string;

  @ApiProperty({ description: '여행 시작일 timestamp (초단위, 10자리)' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_KIND_MSG('여행 시작일') })
  readonly startDate: number;

  @ApiProperty({ description: '여행 종료일 timestamp (초단위, 10자리)' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_KIND_MSG('여행 종료일') })
  readonly endDate: number;

  @ApiProperty({ description: '여행기 커버 이미지 경로' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly themePath: string;

  @ApiProperty({ type: [TagCreateDTO], description: '태그 목록' })
  @ArrayMaxSize(MAX_TAGS, { message: TAG_EXCEEDED_MSG })
  @ValidateNested({ each: true })
  @Type(() => TagCreateDTO)
  readonly tags: TagCreateDTO[];

  constructor(
    name: string,
    startDate: number,
    endDate: number,
    themePath: string,
    tags: TagCreateDTO[],
  ) {
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.themePath = themePath;
    this.tags = tags;
  }
}

export class PikmiCreateDTO implements PikmiCreate {
  @ApiProperty({ description: '픽미 이름' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly name: string;

  @ApiProperty({ description: '픽미 주소' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly address: string;

  @ApiProperty({ description: '픽미 카테고리' })
  @IsIn(Object.values(CATEGORY), { message: IS_IN_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly category: string;

  @ApiProperty({ description: '픽미 경도 값' })
  @Min(MIN_LONGITUDE, { message: LONGITUDE_INVALID_MSG })
  @Max(MAX_LONGITUDE, { message: LONGITUDE_INVALID_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly longitude: number;

  @ApiProperty({ description: '픽미 위도 값' })
  @Min(MIN_LATITUDE, { message: LATITUDE_INVALID_MSG })
  @Max(MAX_LATITUDE, { message: LATITUDE_INVALID_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly latitude: number;

  @ApiProperty({ description: '픽미 자세한 정보 링크' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly link: string;

  constructor(
    name: string,
    address: string,
    category: string,
    longitude: number,
    latitude: number,
    link: string,
  ) {
    this.name = name;
    this.address = address;
    this.category = category;
    this.longitude = longitude;
    this.latitude = latitude;
    this.link = link;
  }
}

export class PikiUpdateDTO implements PikiUpdate {
  @ApiProperty({ description: '피키 ID' })
  @IsOptional()
  readonly id: string;

  @ApiProperty({ description: '피키 이름' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly name: string;

  @ApiProperty({ description: '피키 주소' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly address: string;

  @ApiProperty({ description: '피키 카테고리' })
  @IsIn(Object.values(CATEGORY), { message: IS_IN_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly category: string;

  @ApiProperty({ description: '피키 경도 값' })
  @Min(MIN_LONGITUDE, { message: LONGITUDE_INVALID_MSG })
  @Max(MAX_LONGITUDE, { message: LONGITUDE_INVALID_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly longitude: number;

  @ApiProperty({ description: '피키 위도 값' })
  @Min(MIN_LATITUDE, { message: LATITUDE_INVALID_MSG })
  @Max(MAX_LATITUDE, { message: LATITUDE_INVALID_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly latitude: number;

  @ApiProperty({ description: '피키 자세한 정보 링크' })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly link: string;

  constructor(
    id: string,
    name: string,
    address: string,
    category: string,
    longitude: number,
    latitude: number,
    link: string,
  ) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.category = category;
    this.longitude = longitude;
    this.latitude = latitude;
    this.link = link;
  }
}

export class PikisUpdateDTO implements PikisUpdate {
  @ApiProperty({ description: '피키 수정 일자 (몇번째 날인지), 0-based' })
  @Min(0, { message: INDEX_NEGATIVE_MSG })
  @IsInt({ message: INDEX_NOT_INT_MSG })
  readonly index: number;

  @ApiProperty({ type: [PikiUpdateDTO], description: '피키 목록' })
  @ArrayMaxSize(MAX_PIKI_PER_DAY, { message: PIKI_EXCEEDED_MSG })
  @ValidateNested({ each: true })
  @Type(() => PikiUpdateDTO)
  readonly pikis: PikiUpdateDTO[];

  constructor(index: number, pikis: PikiUpdateDTO[]) {
    this.index = index;
    this.pikis = pikis;
  }
}

export class IdResponseDTO implements IdResponse {
  @ApiProperty({ description: '변동된 다큐먼트의 ID' })
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export class IdsResponseDTO implements IdsResponse {
  @ApiProperty({ description: '변동된 다큐먼트들의 ID 리스트' })
  readonly ids: string[];

  constructor(...ids: string[]) {
    this.ids = ids;
  }
}

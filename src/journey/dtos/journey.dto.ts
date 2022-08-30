import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsIn,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  MAX_JOURNEY_NAME_LENGTH,
  MAX_TAGS,
  MAX_TAG_TOPIC_LENGTH,
} from '../../common/validation/validation.constants';
import {
  IS_IN_MSG,
  IS_NOT_EMPTY_KIND_MSG,
  IS_NOT_EMPTY_MSG,
  JOURNEY_NAME_LENGTH_EXCEEDED_MSG,
  TAG_EXCEEDED_MSG,
  TAG_TOPIC_LENGTH_EXCEEDED_MSG,
} from '../../common/validation/validation.messages';
import { ORIENTATION } from '../schemas/orientation';
import { IdResponse, JourneyCreate, TagCreate } from './journey.interface';

export class JourneyCreateDto implements JourneyCreate {
  @MaxLength(MAX_JOURNEY_NAME_LENGTH, {
    message: JOURNEY_NAME_LENGTH_EXCEEDED_MSG,
  })
  @IsNotEmpty({ message: IS_NOT_EMPTY_KIND_MSG('여행 이름') })
  readonly name: string;

  @IsNotEmpty({ message: IS_NOT_EMPTY_KIND_MSG('여행 시작일') })
  readonly startDate: number;

  @IsNotEmpty({ message: IS_NOT_EMPTY_KIND_MSG('여행 종료일') })
  readonly endDate: number;

  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly themePath: string;

  @ArrayMaxSize(MAX_TAGS, { message: TAG_EXCEEDED_MSG })
  @ValidateNested({ each: true })
  @Type(() => TagCreateDto)
  readonly tags: TagCreateDto[];

  constructor(
    name: string,
    startDate: number,
    endDate: number,
    themePath: string,
    tags: TagCreateDto[],
  ) {
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.themePath = themePath;
    this.tags = tags;
  }
}

export class TagCreateDto implements TagCreate {
  @MaxLength(MAX_TAG_TOPIC_LENGTH, { message: TAG_TOPIC_LENGTH_EXCEEDED_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_KIND_MSG('태그 이름') })
  readonly topic: string;

  @IsIn(Object.values(ORIENTATION), { message: IS_IN_MSG })
  @IsNotEmpty({ message: IS_NOT_EMPTY_MSG })
  readonly orientation: string;

  constructor(topic: string, orientation: string) {
    this.topic = topic;
    this.orientation = orientation;
  }
}

export class IdResponseDto implements IdResponse {
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}

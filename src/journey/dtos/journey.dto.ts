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
import { UserResponseDTO } from '../../user/dtos/user.dto';
import { CATEGORY } from '../schemas/category';
import { JourneyDocument } from '../schemas/journey.schema';
import { ORIENTATION } from '../schemas/orientation';
import {
  IdResponse,
  IdsResponse,
  JourneyCreateRequest,
  PikisUpdateRequest,
  PikiUpdateRequest,
  PikmiCreateRequest,
  TagUpdateRequest,
  TagsUpdateRequest,
  SimpleJourneyResponse,
  JourneyListResponse,
} from './journey.interface';

export class SimpleJourneyResponseDTO implements SimpleJourneyResponse {
  @ApiProperty({ description: '여행 ID' })
  readonly id: string;

  @ApiProperty({ description: '여행 이름' })
  readonly name: string;

  @ApiProperty({ description: '여행 시작일 timestamp' })
  readonly startDate: number;

  @ApiProperty({ description: '여행 종료일 timestamp' })
  readonly endDate: number;

  @ApiProperty({ description: '여행기 커버 이미지 경로' })
  readonly themePath: string;

  @ApiProperty({
    type: [UserResponseDTO],
    description: '여행에 속한 유저 목록',
  })
  readonly users: UserResponseDTO[];

  static from(journey: JourneyDocument): SimpleJourneyResponseDTO {
    return new SimpleJourneyResponseDTO(
      journey._id.toString(),
      journey.name,
      journey.start,
      journey.end,
      journey.theme,
      journey.users.map((user) => UserResponseDTO.from(user)),
    );
  }

  constructor(
    id: string,
    name: string,
    startDate: number,
    endDate: number,
    themePath: string,
    users: UserResponseDTO[],
  ) {
    this.id = id;
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.themePath = themePath;
    this.users = users;
  }
}

export class JourneyListResponseDTO implements JourneyListResponse {
  @ApiProperty({
    type: [SimpleJourneyResponseDTO],
    description: '여행 목록',
  })
  readonly journeys: SimpleJourneyResponseDTO[];

  static from(journeys: JourneyDocument[]) {
    return new JourneyListResponseDTO(
      journeys.map((journey) => SimpleJourneyResponseDTO.from(journey)),
    );
  }

  constructor(journeys: SimpleJourneyResponseDTO[]) {
    this.journeys = journeys;
  }
}

export class TagUpdateRequestDTO implements TagUpdateRequest {
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

export class JourneyCreateRequestDTO implements JourneyCreateRequest {
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

  @ApiProperty({ type: [TagUpdateRequestDTO], description: '태그 목록' })
  @ArrayMaxSize(MAX_TAGS, { message: TAG_EXCEEDED_MSG })
  @ValidateNested({ each: true })
  @Type(() => TagUpdateRequestDTO)
  readonly tags: TagUpdateRequestDTO[];

  constructor(
    name: string,
    startDate: number,
    endDate: number,
    themePath: string,
    tags: TagUpdateRequestDTO[],
  ) {
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.themePath = themePath;
    this.tags = tags;
  }
}

export class PikmiCreateRequestDTO implements PikmiCreateRequest {
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

export class PikiUpdateRequestDTO implements PikiUpdateRequest {
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

export class PikisUpdateRequestDTO implements PikisUpdateRequest {
  @ApiProperty({ description: '피키 수정 일자 (몇번째 날인지), 0-based' })
  @Min(0, { message: INDEX_NEGATIVE_MSG })
  @IsInt({ message: INDEX_NOT_INT_MSG })
  readonly index: number;

  @ApiProperty({ type: [PikiUpdateRequestDTO], description: '피키 목록' })
  @ArrayMaxSize(MAX_PIKI_PER_DAY, { message: PIKI_EXCEEDED_MSG })
  @ValidateNested({ each: true })
  @Type(() => PikiUpdateRequestDTO)
  readonly pikis: PikiUpdateRequestDTO[];

  constructor(index: number, pikis: PikiUpdateRequestDTO[]) {
    this.index = index;
    this.pikis = pikis;
  }
}

export class TagsUpdateRequestDTO implements TagsUpdateRequest {
  @ApiProperty({ type: [TagUpdateRequestDTO], description: '태그 목록' })
  @ArrayMaxSize(MAX_TAGS, { message: TAG_EXCEEDED_MSG })
  @ValidateNested({ each: true })
  @Type(() => TagUpdateRequestDTO)
  readonly tags: TagUpdateRequestDTO[];

  constructor(tags: TagUpdateRequestDTO[]) {
    this.tags = tags;
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

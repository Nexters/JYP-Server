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
import { UserResponse } from '../../user/dtos/user.interface';
import { CATEGORY } from '../schemas/category';
import { JourneyDocument, Piki, Pikmi, Tag } from '../schemas/journey.schema';
import { ORIENTATION } from '../schemas/orientation';
import { DefaultTag } from '../tag/default.tags';
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
  TagResponse,
  PikmiResponse,
  PikiResponse,
  JourneyResponse,
  DefaultTagResponse,
  DefaultTagsResponse,
  TagsResponse,
  PikidayResponse,
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

export class TagResponseDTO implements TagResponse {
  @ApiProperty({ description: '태그 주제' })
  readonly topic: string;

  @ApiProperty({ description: '태그 성향' })
  readonly orientation: string;

  @ApiProperty({
    type: [UserResponseDTO],
    description: '태그를 선택한 유저 목록',
  })
  readonly users: UserResponseDTO[];

  static aggregate(tags: Tag[]): TagResponseDTO[] {
    const grouped = tags
      .map(
        (tag) =>
          new Map([[`${tag.topic}&${tag.orient}`, tag.user ? [tag.user] : []]]),
      )
      .reduce((left, right) => {
        for (const entry of right.entries()) {
          const [key, rightVal] = entry;
          const leftVal = left.get(key) || [];
          left.set(key, leftVal.concat(rightVal));
        }
        return left;
      }, new Map());
    const aggregated = [];
    for (const entry of grouped.entries()) {
      const [key, users] = entry;
      const [topic, orientation] = key.split('&');
      const userResponseDtos = users.map((user) => UserResponseDTO.from(user));
      aggregated.push(new TagResponseDTO(topic, orientation, userResponseDtos));
    }
    return aggregated;
  }

  constructor(topic: string, orientation: string, users: UserResponse[]) {
    this.topic = topic;
    this.orientation = orientation;
    this.users = users;
  }
}

export class TagsResponseDTO implements TagsResponse {
  @ApiProperty({
    type: [TagResponseDTO],
    description: '태그 목록',
  })
  readonly tags: TagResponseDTO[];

  constructor(tags: TagResponseDTO[]) {
    this.tags = tags;
  }
}

export class DefaultTagResponseDTO implements DefaultTagResponse {
  @ApiProperty({ description: '태그 주제' })
  readonly topic: string;

  @ApiProperty({ description: '태그 성향' })
  readonly orientation: string;

  static from(defaultTag: DefaultTag): DefaultTagResponseDTO {
    return new DefaultTagResponseDTO(defaultTag.topic, defaultTag.orientation);
  }

  constructor(topic: string, orientation: string) {
    this.topic = topic;
    this.orientation = orientation;
  }
}

export class DefaultTagsResponseDTO implements DefaultTagsResponse {
  @ApiProperty({
    type: [DefaultTagResponseDTO],
    description: '디폴트 태그 목록',
  })
  readonly tags: DefaultTagResponseDTO[];

  static from(defaultTags: DefaultTag[]): DefaultTagsResponseDTO {
    return new DefaultTagsResponseDTO(
      defaultTags.map((defaultTag) => DefaultTagResponseDTO.from(defaultTag)),
    );
  }

  constructor(tags: DefaultTagResponseDTO[]) {
    this.tags = tags;
  }
}

export class PikmiResponseDTO implements PikmiResponse {
  @ApiProperty({ description: '픽미 ID' })
  readonly id: string;

  @ApiProperty({ description: '픽미 이름' })
  readonly name: string;

  @ApiProperty({ description: '픽미 주소' })
  readonly address: string;

  @ApiProperty({ description: '픽미 카테고리' })
  readonly category: string;

  @ApiProperty({
    type: [UserResponseDTO],
    description: '픽미에 좋아요 누른 유저 목록',
  })
  readonly likeBy: UserResponseDTO[];

  @ApiProperty({ description: '픽미 경도 값' })
  readonly longitude: number;

  @ApiProperty({ description: '픽미 위도 값' })
  readonly latitude: number;

  @ApiProperty({ description: '픽미 자세한 정보 링크' })
  readonly link: string;

  static from(pikmi: Pikmi): PikmiResponseDTO {
    return new PikmiResponseDTO(
      pikmi._id.toString(),
      pikmi.name,
      pikmi.addr,
      pikmi.cate,
      pikmi.likeBy.map((user) => UserResponseDTO.from(user)),
      pikmi.lon,
      pikmi.lat,
      pikmi.link,
    );
  }

  constructor(
    id: string,
    name: string,
    address: string,
    category: string,
    likeBy: UserResponse[],
    longitude: number,
    latitude: number,
    link: string,
  ) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.category = category;
    this.likeBy = likeBy;
    this.longitude = longitude;
    this.latitude = latitude;
    this.link = link;
  }
}

export class PikiResponseDTO implements PikiResponse {
  @ApiProperty({ description: '피키 ID' })
  readonly id: string;

  @ApiProperty({ description: '피키 이름' })
  readonly name: string;

  @ApiProperty({ description: '피키 주소' })
  readonly address: string;

  @ApiProperty({ description: '피키 카테고리' })
  readonly category: string;

  @ApiProperty({ description: '피키 경도 값' })
  readonly longitude: number;

  @ApiProperty({ description: '피키 위도 값' })
  readonly latitude: number;

  @ApiProperty({ description: '피키 자세한 정보 링크' })
  readonly link: string;

  static from(piki: Piki): PikiResponseDTO {
    return new PikiResponseDTO(
      piki._id.toString(),
      piki.name,
      piki.addr,
      piki.cate,
      piki.lon,
      piki.lat,
      piki.link,
    );
  }

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

export class PikidayResponseDTO implements PikidayResponse {
  @ApiProperty({
    type: [PikiResponseDTO],
    description: '피키 목록',
  })
  readonly pikis: PikiResponse[];

  static from(pikis: Piki[]) {
    return new PikidayResponseDTO(
      pikis.map((piki) => PikiResponseDTO.from(piki)),
    );
  }

  constructor(pikis: PikiResponseDTO[]) {
    this.pikis = pikis;
  }
}

export class JourneyResponseDTO implements JourneyResponse {
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

  @ApiProperty({
    type: [TagResponseDTO],
    description: '태그 목록',
  })
  readonly tags: TagResponseDTO[];

  @ApiProperty({
    type: [PikmiResponseDTO],
    description: '픽미 목록',
  })
  readonly pikmis: PikmiResponseDTO[];

  @ApiProperty({
    type: [PikidayResponseDTO],
    description: '피키데이 목록',
  })
  readonly pikidays: PikidayResponseDTO[];

  static from(journey: JourneyDocument): JourneyResponseDTO {
    return new JourneyResponseDTO(
      journey._id.toString(),
      journey.name,
      journey.start,
      journey.end,
      journey.theme,
      journey.users.map((user) => UserResponseDTO.from(user)),
      TagResponseDTO.aggregate(journey.tags),
      journey.pikmis.map((pikmi) => PikmiResponseDTO.from(pikmi)),
      journey.pikis.map((pikis) => PikidayResponseDTO.from(pikis)),
    );
  }

  constructor(
    id: string,
    name: string,
    startDate: number,
    endDate: number,
    themePath: string,
    users: UserResponseDTO[],
    tags: TagResponseDTO[],
    pikmis: PikmiResponseDTO[],
    pikidays: PikidayResponseDTO[],
  ) {
    this.id = id;
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.themePath = themePath;
    this.users = users;
    this.tags = tags;
    this.pikmis = pikmis;
    this.pikidays = pikidays;
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

import { IdResponse, JourneyCreate, TagCreate } from './journey.interface';

export class JourneyCreateDto implements JourneyCreate {
  readonly name: string;
  readonly startDate: number;
  readonly endDate: number;
  readonly themePath: string;
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
  readonly topic: string;
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

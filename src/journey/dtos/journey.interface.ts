export interface TagCreate {
  topic: string;
  orientation: string;
}

export interface JourneyCreate {
  name: string;
  startDate: number;
  endDate: number;
  themePath: string;
  tags: TagCreate[];
}

export interface IdResponse {
  id: string;
}

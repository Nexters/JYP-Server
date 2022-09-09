export interface TagUpdateRequest {
  topic: string;
  orientation: string;
}

export interface JourneyCreateRequest {
  name: string;
  startDate: number;
  endDate: number;
  themePath: string;
  tags: TagUpdateRequest[];
}

export interface PikmiCreateRequest {
  name: string;
  address: string;
  category: string;
  longitude: number;
  latitude: number;
  link: string;
}

export interface PikiUpdateRequest {
  name: string;
  address: string;
  category: string;
  longitude: number;
  latitude: number;
  link: string;
}

export interface PikisUpdateRequest {
  index: number;
  pikis: PikiUpdateRequest[];
}

export interface TagsUpdateRequest {
  tags: TagUpdateRequest[];
}

export interface IdResponse {
  id: string;
}

export interface IdsResponse {
  ids: string[];
}

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

export interface PikmiCreate {
  name: string;
  address: string;
  category: string;
  longitude: number;
  latitude: number;
  link: string;
}

export interface PikiUpdate {
  name: string;
  address: string;
  category: string;
  longitude: number;
  latitude: number;
  link: string;
}

export interface PikisUpdate {
  index: number;
  pikis: PikiUpdate[];
}

export interface IdResponse {
  id: string;
}

export interface IdsResponse {
  ids: string[];
}

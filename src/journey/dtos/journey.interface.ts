import { UserResponse } from '../../user/dtos/user.interface';

export interface SimpleJourneyResponse {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  themePath: string;
  users: UserResponse[];
}

export interface JourneyListResponse {
  journeys: SimpleJourneyResponse[];
}

export interface TagResponse {
  topic: string;
  orientation: string;
  users: UserResponse[];
}

export interface TagsResponse {
  tags: TagResponse[];
}

export interface PikmiResponse {
  id: string;
  name: string;
  address: string;
  category: string;
  likeBy: UserResponse[];
  longitude: number;
  latitude: number;
  link: string;
}

export interface PikiResponse {
  id: string;
  name: string;
  address: string;
  category: string;
  longitude: number;
  latitude: number;
  link: string;
}

export interface PikidayResponse {
  pikis: PikiResponse[];
}

export interface JourneyResponse {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  themePath: string;
  users: UserResponse[];
  tags: TagResponse[];
  pikmis: PikmiResponse[];
  pikidays: PikidayResponse[];
}

export interface DefaultTagResponse {
  topic: string;
  orientation: string;
}

export interface DefaultTagsResponse {
  tags: DefaultTagResponse[];
}

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

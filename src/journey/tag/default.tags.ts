import { ORIENTATION } from '../schemas/orientation';

export interface DefaultTag {
  topic: string;
  orientation: string;
}

export const DEFAULT_TAGS: DefaultTag[] = [
  { topic: '고기', orientation: ORIENTATION.LIKE },
  { topic: '해산물', orientation: ORIENTATION.LIKE },
  { topic: '쇼핑', orientation: ORIENTATION.LIKE },
  { topic: '산', orientation: ORIENTATION.LIKE },
  { topic: '바다', orientation: ORIENTATION.LIKE },
  { topic: '도시', orientation: ORIENTATION.LIKE },
  { topic: '핫플레이스', orientation: ORIENTATION.LIKE },
  { topic: '고기', orientation: ORIENTATION.DISLIKE },
  { topic: '해산물', orientation: ORIENTATION.DISLIKE },
  { topic: '쇼핑', orientation: ORIENTATION.DISLIKE },
  { topic: '산', orientation: ORIENTATION.DISLIKE },
  { topic: '바다', orientation: ORIENTATION.DISLIKE },
  { topic: '도시', orientation: ORIENTATION.DISLIKE },
  { topic: '핫플레이스', orientation: ORIENTATION.DISLIKE },
  { topic: '모두 찬성', orientation: ORIENTATION.NOMATTER },
  { topic: '상관없어', orientation: ORIENTATION.NOMATTER },
];

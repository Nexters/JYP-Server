import { ValidationArguments } from 'class-validator';
import {
  MAX_JOURNEY_DAYS,
  MAX_JOURNEY_NAME_LENGTH,
  MAX_JOURNEY_PER_USER,
  MAX_LATITUDE,
  MAX_LONGITUDE,
  MAX_PIKMI_PER_JOURNEY,
  MAX_TAGS,
  MAX_TAG_TOPIC_LENGTH,
  MIN_LATITUDE,
  MIN_LONGITUDE,
} from './validation.constants';

export const MAX_LENGTH_MSG =
  '$property 값은 $constraint1자를 초과할 수 없습니다.';

export const IS_NOT_EMPTY_MSG = '$property 값은 비어있을 수 없습니다.';

export const IS_EMUN_MSG = (args: ValidationArguments) => {
  return `${args.property} 값은 ${Object.values(
    args.constraints[0],
  )} 중 하나여야 합니다.`;
};

export const IS_IN_MSG = '$property 값은 $constraint1 중 하나여야 합니다.';

export const JOURNEY_EXCEEDED_MSG = `여행은 ${MAX_JOURNEY_PER_USER}개까지만 만들 수 있어요!`;

export const TIME_RANGE_INVALID_MSG = `여행 기간은 ${MAX_JOURNEY_DAYS}일 이내로 설정해주세요!`;

export const TAG_EXCEEDED_MSG = `태그는 ${MAX_TAGS}개까지만 설정할 수 있어요!`;

export const JOURNEY_NAME_LENGTH_EXCEEDED_MSG = `여행 이름은 ${MAX_JOURNEY_NAME_LENGTH}자 이내로 입력해주세요!`;

export const TAG_TOPIC_LENGTH_EXCEEDED_MSG = `태그 이름은 ${MAX_TAG_TOPIC_LENGTH}자 이내로 입력해주세요!`;

export const IS_NOT_EMPTY_KIND_MSG = (field: string) =>
  `${field} 정보가 입력되지 않았어요!`;

export const INVALID_ID_IN_JWT_MSG = `존재하지 않는 회원 ID로 인증되었습니다.`;

export const JOURNEY_NOT_EXIST_MSG = `해당 여행이 존재하지 않습니다.`;

export const PIKMI_EXCEEDED_MSG = `여행 후보 장소는 ${MAX_PIKMI_PER_JOURNEY}개까지만 추가할 수 있어요!`;

export const LONGITUDE_INVALID_MSG = `경도 값은 ${MIN_LONGITUDE}~${MAX_LONGITUDE} 사이의 값이어야 해요!`;

export const LATITUDE_INVALID_MSG = `위도 값은 ${MIN_LATITUDE}~${MAX_LATITUDE} 사이의 값이어야 해요!`;

export const INDEX_OUT_OF_RANGE_MSG = `인덱스 값이 범위를 벗어났어요!`;

export const DEFAULT_MSG = '잘못된 요청입니다.';

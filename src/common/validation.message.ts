import { ValidationArguments } from 'class-validator';
import { MAX_JOURNEY_PER_USER } from './constants';

export const MAX_LENGTH_MSG =
  '$property 값은 $constraint1자를 초과할 수 없습니다.';

export const IS_NOT_EMPTY_MSG = '$property 값은 비어있을 수 없습니다.';

export const IS_EMUN_MSG = (args: ValidationArguments) => {
  return `${args.property} 값은 ${Object.values(
    args.constraints[0],
  )} 중 하나여야 합니다.`;
};

export const IS_IN_MSG = '$property 값은 $constraint1 중 하나여야 합니다.';

export const JOURNEY_EXCEEDED = `여행은 ${MAX_JOURNEY_PER_USER}개까지만 만들 수 있어요!`;

export const DEFAULT_MSG = '잘못된 요청입니다.';

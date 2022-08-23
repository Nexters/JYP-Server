import { ValidationArguments } from 'class-validator';

export const MAX_LENGTH_MSG =
  '$property 값은 $constraint1자를 초과할 수 없습니다.';

export const IS_NOT_EMPTY_MSG = '$property 값은 비어있을 수 없습니다.';

export const IS_EMUN_MSG = (args: ValidationArguments) => {
  return `${args.property} 값은 ${Object.values(
    args.constraints[0],
  )} 중 하나여야 합니다.`;
};

export const IS_IN_MSG = '$property 값은 $constraint1 중 하나여야 합니다.';

export const DEFAULT_MSG = '잘못된 요청입니다.';

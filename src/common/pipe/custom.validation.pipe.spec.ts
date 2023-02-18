import { BadRequestException } from '@nestjs/common';
import { MAX_JOURNEY_DAYS } from '../validation/validation.constants';
import { TIME_RANGE_INVALID_MSG } from '../validation/validation.messages';
import { TimeRangeValidationPipe } from './custom.validation.pipe';

describe('TimeRangeValidationPipe', () => {
  let timeRangeValidationPipe: TimeRangeValidationPipe;

  beforeEach(() => {
    timeRangeValidationPipe = new TimeRangeValidationPipe();
  });

  it('value에 startDate가 없으면 value를 그대로 리턴한다.', () => {
    const value = { endDate: 1 };
    const result = timeRangeValidationPipe.transform(value, null);
    expect(result).toEqual(value);
  });

  it('value에 endDate가 없으면 value를 그대로 리턴한다.', () => {
    const value = { startDate: 1 };
    const result = timeRangeValidationPipe.transform(value, null);
    expect(result).toEqual(value);
  });

  it('startDate와 endDate 간격이 MAX_JOURNEY_DAYS를 초과하면 BadRequestException을 throw한다.', () => {
    const startDate = 1535587200;
    const endDate = startDate + MAX_JOURNEY_DAYS * 3600 * 24;
    const value = { startDate: startDate, endDate: endDate };
    expect(() => timeRangeValidationPipe.transform(value, null)).toThrowError(
      new BadRequestException(TIME_RANGE_INVALID_MSG),
    );
  });

  it('startDate와 endDate 간격이 MAX_JOURNEY_DAYS이내이면 value를 그대로 리턴한다.', () => {
    const startDate = 1535587200;
    const endDate = startDate + (MAX_JOURNEY_DAYS - 1) * 3600 * 24;
    const value = { startDate: startDate, endDate: endDate };
    const result = timeRangeValidationPipe.transform(value, null);
    expect(result).toEqual(value);
  });
});

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { MAX_JOURNEY_DAYS } from '../validation/validation.constants';
import { getDayDiff } from '../util';
import { TIME_RANGE_INVALID_MSG } from '../validation/validation.messages';

@Injectable()
export class TimeRangeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value.startDate || !value.endDate) {
      return value;
    }
    const dayDiff = getDayDiff(value.startDate, value.endDate);
    if (dayDiff > MAX_JOURNEY_DAYS) {
      throw new BadRequestException(TIME_RANGE_INVALID_MSG);
    }
    return value;
  }
}

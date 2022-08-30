import { BadRequestException } from '@nestjs/common';

export class LimitExceededException extends BadRequestException {}

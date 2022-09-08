import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class LimitExceededException extends BadRequestException {}

export class InvalidJwtPayloadException extends UnauthorizedException {}

export class JourneyNotExistException extends BadRequestException {}

export class IndexOutOfRangeException extends BadRequestException {}

export class UnauthenticatedException extends UnauthorizedException {}

export class PikmiNotExistException extends BadRequestException {}

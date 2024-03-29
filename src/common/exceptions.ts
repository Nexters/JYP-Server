import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

export class LimitExceededException extends BadRequestException {}

export class InvalidJwtPayloadException extends UnauthorizedException {}

export class JourneyNotExistException extends BadRequestException {}

export class IndexOutOfRangeException extends BadRequestException {}

export class UnauthenticatedException extends UnauthorizedException {}

export class PikmiNotExistException extends BadRequestException {}

export class AlreadyJoinedJourneyException extends BadRequestException {}

export class ExpiredJourneyException extends BadRequestException {}

export class NotFoundUserException extends BadRequestException {}

export class UserDeletionFailedException extends InternalServerErrorException {}

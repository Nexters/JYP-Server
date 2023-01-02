import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AlreadyJoinedJourneyException,
  IndexOutOfRangeException,
  InvalidJwtPayloadException,
  JourneyNotExistException,
  LimitExceededException,
  UnauthenticatedException,
} from '../common/exceptions';
import { DEFAULT_MSG } from '../common/validation/validation.messages';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      code: String(status) + '00',
      message: exception.message,
    });
  }
}

// TODO: const request = ctx.getRequest<Request>();
@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    console.info(exception.stack);
    response.status(status).json({
      code: String(status) + '00',
      message: exception.message,
    });
  }
}

@Catch(InvalidJwtPayloadException)
export class InvalidJwtPayloadExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidJwtPayloadException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    response.status(status).json({
      code: String(status) + '01',
      message: exception.message,
    });
  }
}

@Catch(UnauthenticatedException)
export class UnauthenticatedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthenticatedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    response.status(status).json({
      code: String(status) + '02',
      message: exception.message,
    });
  }
}

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const response = getResponse(host);
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    response.status(status).json({
      code: String(status) + '01',
      message: preprocessMessage(exceptionResponse?.['message']) || DEFAULT_MSG,
    });
  }
}

@Catch(LimitExceededException)
export class LimitExceededExceptionFilter implements ExceptionFilter {
  catch(exception: LimitExceededException, host: ArgumentsHost) {
    const response = getResponse(host);
    const status = exception.getStatus();
    response.status(status).json({
      code: String(status) + '02',
      message: exception.message,
    });
  }
}

@Catch(JourneyNotExistException)
export class JourneyNotExistExceptionFliter implements ExceptionFilter {
  catch(exception: JourneyNotExistException, host: ArgumentsHost) {
    const response = getResponse(host);
    const status = exception.getStatus();
    response.status(status).json({
      code: String(status) + '03',
      message: exception.message,
    });
  }
}

@Catch(IndexOutOfRangeException)
export class IndexOutOfRangeExceptionFilter implements ExceptionFilter {
  catch(exception: IndexOutOfRangeException, host: ArgumentsHost) {
    const response = getResponse(host);
    const status = exception.getStatus();
    response.status(status).json({
      code: String(status) + '04',
      message: exception.message,
    });
  }
}

@Catch(AlreadyJoinedJourneyException)
export class AlreadyJoinedJourneyExceptionFilter implements ExceptionFilter {
  catch(exception: IndexOutOfRangeException, host: ArgumentsHost) {
    const response = getResponse(host);
    const status = exception.getStatus();
    response.status(status).json({
      code: String(status) + '05',
      message: exception.message,
    });
  }
}

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    Logger.error(error);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(500).json({
      code: '50000',
      // TODO: 클라이언트 연동 완료 이후에 보안을 위해 에러 메시지가 노출되지 않도록 수정해야 함
      message: error.message,
    });
  }
}

const getResponse = (host: ArgumentsHost) =>
  host.switchToHttp().getResponse<Response>();

const NESTED_ARRAY_VALIDATION_MSG_REGEX = new RegExp(
  '^[a-zA-Z]+\\.[0-9]+\\.(.*)$',
);

const NESTED_OBJECT_VALIDATION_MSG_REGEX = new RegExp('^[a-zA-Z]+\\.(.*)$');

const preprocessMessage = (message: any) => {
  if (Array.isArray(message) && message[0]) {
    return preprocessMessage(message[0]);
  } else if (typeof message === 'string') {
    // nested field의 validation의 경우 메시지 앞에 prefix가 붙어서 온다.
    // ex) tags.1.{원래 메시지}
    // 따라서 여기서 원래 메시지만 추출하는 작업을 한다.
    const firstSearchResult = NESTED_ARRAY_VALIDATION_MSG_REGEX.exec(message);
    if (firstSearchResult != null && firstSearchResult?.[1]) {
      return firstSearchResult[1];
    } else {
      const secondSearchResult =
        NESTED_OBJECT_VALIDATION_MSG_REGEX.exec(message);
      if (secondSearchResult != null && secondSearchResult?.[1]) {
        return secondSearchResult[1];
      } else {
        return message;
      }
    }
  } else {
    return '';
  }
};

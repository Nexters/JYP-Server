import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { DEFAULT_MSG } from '../common/validation.message';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    console.log(exception.stack);
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
      code: String(status) + '01',
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
    if (typeof exceptionResponse === 'object') {
      response.status(status).json({
        code: String(status) + '01',
        message: exceptionResponse?.['message']?.[0] || DEFAULT_MSG,
      });
    } else {
      response.status(status).json({
        code: String(status) + '01',
        message: exceptionResponse,
      });
    }
  }
}

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(400).json({
      code: '50000',
      message: error.message,
    });
  }
}

const getResponse = (host: ArgumentsHost) =>
  host.switchToHttp().getResponse<Response>();

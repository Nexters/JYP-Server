import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestMethod,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data: data,
        message: 'Success',
        code: context.switchToHttp().getResponse().statusCode + '00',
      })),
    );
  }
}

@Injectable()
export class CustomHeaderInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<any>();
    const overrideId = request.headers['jyp-override-id'];
    if (overrideId != null && request.user) {
      request.user.id = overrideId;
    }

    return next.handle();
  }
}

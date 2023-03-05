import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = morgan('combined');

  use(req: Request, res: Response, next: NextFunction) {
    this.logger(req, res, next);
  }
}

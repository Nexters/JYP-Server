import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly masterKey = process.env.JWT_MASTER_KEY;

  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const inputMasterKey = req.headers['jyp-jwt-master-key'];
    if (this.masterKey && inputMasterKey != this.masterKey) {
      next();
      return;
    }
    const overrideId = req.headers['jyp-override-id'];
    if (!overrideId) {
      next();
      return;
    }
    const payload = { id: overrideId };
    const token = this.jwtService.sign(payload);
    const authHeader = `Bearer ${token}`;
    req.headers['authorization'] = authHeader;
    next();
  }
}

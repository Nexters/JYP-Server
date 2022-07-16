import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  authTest(): string {
    return 'Auth Test'
  }
}

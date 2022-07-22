import { Module, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [HttpModule],
  providers: [AuthService, {
    provide: APP_PIPE,
    useClass: ValidationPipe
  }],
  controllers: [AuthController]
})
export class AuthModule {}

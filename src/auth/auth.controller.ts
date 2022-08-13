import { Controller, Get, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Headers } from '@nestjs/common';
import {
  KakaoInformationRequestDTO,
  KakaoLoginResponseDTO,
} from './dto/auth.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import {
  HttpExceptionFilter,
  UnauthorizedExceptionFilter,
} from '../http/http-exception.filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: KakaoInformationRequestDTO })
  @ApiOperation({ summary: '카카오 로그인' })
  @UseFilters(new HttpExceptionFilter(), new UnauthorizedExceptionFilter())
  @Get('/kakao/login')
  async kakaoLogin(@Headers() headers): Promise<KakaoLoginResponseDTO> {
    return await this.authService.validateKakaoUser(headers['authorization']);
  }
}

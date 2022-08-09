import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoInformationRequestDTO, KakaoInformationResponseDTO } from './dto/authValidation';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { ErrorFilter, HttpExceptionFilter } from '../http/http-exception.filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: KakaoInformationRequestDTO })
  @ApiOperation({ summary: '카카오 로그인' })
  @UseFilters(new HttpExceptionFilter())
  @Post('/kakao/login')
  async kakaoLogin(@Body() requestBody: string): Promise<object> {
    return await this.authService.validateKakaoUser({
      accessToken: requestBody['accessToken'],
    });
  }
}

import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service'
import { KakaoInformationResponseDTO, KakaoInformationRequestDTO } from './auth.dto/authValidation';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(AuthGuard)
  @Get('/:id')
  getTest(@Param('id') testId: number): string {
    return this.authService.authTest();
  }

  @Get('/kakao')
  async requestAuthCode(): Promise<object> {
    return await this.authService.getAuthToken();
  }

  @ApiBody({ type: KakaoInformationRequestDTO })
  @ApiOperation({summary: '카카오 정보 RETURN'})
  @Get('/kakao/userinfo')
  async getKakaoUserInfo(@Query() requestQueryString: KakaoInformationRequestDTO): Promise<KakaoInformationResponseDTO> {
    return await this.authService.getKakaoUserInformation(requestQueryString['accessToken']);
  }
}

import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service'
import { KakaoInformationResponseDTO, KakaoInformationRequestDTO } from './dto/authValidation';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from './security/auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/kakao')
  async requestAuthCode(): Promise<object> {
    return await this.authService.getAuthToken();
  }

  @ApiBody({type: KakaoInformationRequestDTO})
  @ApiOperation({summary: '카카오 로그인'})
  @Post('/kakao/sign-in')
  async kakaoLogin(@Body() requestBody: string): Promise<string> {
    return await this.authService.validateKakaoUser({accessToken: requestBody['accessToken']});
  }

  @ApiBody({ type: KakaoInformationRequestDTO })
  @ApiOperation({summary: '카카오 정보 RETURN'})
  @UseGuards(AuthGuard)
  @Get('/kakao/userinfo')
  // TODO: 사용자 정보를 받으려면 카카오 엑세스 토큰 필요
  async getKakaoUserInfo(@Req() req: Request, @Res() res: Response): Promise<any> {
    return await this.authService.getKakaoUserInformation(req.headers.authorization);
  }
}

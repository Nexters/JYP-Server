import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service'
import { KakaoInformationResponseDTO, KakaoInformationRequestDTO } from './auth.dto/authValidation';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from './auth.security/auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(AuthGuard)
  // @Get('/:id')
  // async getTest(@Param('id') testId: number): Promise<string> {
  //   return await this.authService.authTest();
  // }

  @Get('/kakao')
  async requestAuthCode(): Promise<object> {
    return await this.authService.getAuthToken();
  }

  @ApiBody({ type: KakaoInformationRequestDTO })
  @ApiOperation({summary: '카카오 정보 RETURN'})
  @UseGuards(AuthGuard)
  @Get('/kakao/userinfo')
  async getKakaoUserInfo(@Query() requestQueryString: KakaoInformationRequestDTO, @Res() res: Response): Promise<any> {
    const token = await this.authService.getKakaoUserInformation(requestQueryString['accessToken']);
    return res.json({accessToken: token});
  }

  @Post('/kakao/login')
  async kakaoLogin(@Body() requestBody: string): Promise<string> {
    return await this.authService.kakaoValidateUser({accessToken: requestBody['accessToken']});
  }

  // @Get('/auth')
  // @UseGuards(AuthGuard)
  // async test(@Query() requestQueryString: Kakao): Promise<any> {
  //   const user: any = req['user'];
  //   return '1234';
  // }
}

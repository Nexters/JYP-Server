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

  @ApiBody({type: KakaoInformationRequestDTO})
  @ApiOperation({summary: '카카오 로그인'})
  @Post('/kakao/login')
  async kakaoLogin(@Body() requestBody: string): Promise<string> {
    return await this.authService.kakaoValidateUser({accessToken: requestBody['accessToken']});
  }

  @ApiBody({ type: KakaoInformationRequestDTO })
  @ApiOperation({summary: '카카오 정보 RETURN'})
  @UseGuards(AuthGuard)
  @Get('/kakao/userinfo')
  // TODO: 사용자 정보를 받으려면 카카오 엑세스 토큰 필요
  async getKakaoUserInfo(@Req() req: Request, @Res() res: Response): Promise<any> {
    return await this.authService.getKakaoUserInformation(req.headers.authorization);
  }



  // @Get('/auth')
  // @UseGuards(AuthGuard)
  // async test(@Query() requestQueryString: Kakao): Promise<any> {
  //   const user: any = req['user'];
  //   return '1234';
  // }
}

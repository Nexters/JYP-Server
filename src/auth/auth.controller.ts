import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(AuthGuard)
  @Get('/:id')
  getTest(@Param('id') testId: number): string {
    console.info('id: ', testId);
    return this.authService.authTest();
  }

  @Get('/kakao')
  async requestAuthCode(): Promise<object> {
    return await this.authService.getAuthToken();
  }

  @Get('/callback')
  async callbackAuthCode(@Query() authReuqestQuery): Promise<string> {
    return await this.authService.kakaoLogin(authReuqestQuery);
  }

  @Get('/kakao/userinfo')
  async getKakaoUserInfo(@Query() requestQueryString: string): Promise<any> {
    return await this.authService.getKakaoUserInformation(requestQueryString['accessToken']);
  }
}

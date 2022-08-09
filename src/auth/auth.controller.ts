import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoInformationRequestDTO } from './dto/authValidation';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../http/http-exception.filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/kakao')
  async requestAuthCode(): Promise<object> {
    return await this.authService.getAuthToken();
  }

  @ApiBody({ type: KakaoInformationRequestDTO })
  @ApiOperation({ summary: '카카오 로그인' })
  @UseFilters(new HttpExceptionFilter())
  @Post('/kakao/login')
  async kakaoLogin(@Body() requestBody: string): Promise<object> {
    return await this.authService.validateKakaoUser({
      accessToken: requestBody['accessToken'],
    });
  }

  // @ApiBody({ type: KakaoInformationRequestDTO })
  // @ApiOperation({ summary: '카카오 정보 RETURN' })
  // @UseGuards(AuthGuard)
  // @UseFilters(new HttpExceptionFilter())
  // @UseInterceptors(new TransformInterceptor())
  // @Get('/kakao/userinfo')
  // async getKakaoUserInfo(
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   console.info(req.headers.authorization);
  //   return await this.authService.getKakaoUserInformation(
  //     req.headers.authorization,
  //   );
  // }
}

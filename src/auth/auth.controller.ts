import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Headers } from '@nestjs/common';
import { KakaoLoginResponseDTO, KakaoSignUpResponseDTO } from './dto/auth.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('Auth')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '최초 로그인 여부에 따라 회원가입 / 로그인 을 수행한다.',
  })
  @ApiOkResponse({ description: '성공', type: KakaoSignUpResponseDTO })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiOperation({ summary: '카카오 로그인' })
  @ApiBearerAuth('카카오 Access Token')
  @Get('/kakao/login')
  async kakaoLogin(
    @Headers() headers,
  ): Promise<KakaoLoginResponseDTO | KakaoSignUpResponseDTO> {
    return await this.authService.validateKakaoUser(headers['authorization']);
  }

  @Get('/apple/login')
  async appleLogin(@Headers() headers): Promise<any> {
    return await this.authService.validateAppleUser(headers['authorization']);
  }

  @UseGuards(AuthGuard('apple'))
  @Get('/apple')
  async appleLoginTrigger(@Headers() headers): Promise<any> {
    return HttpStatus.OK;
  }

  // @Post('/apple/redirect')
  // async redirect(@Body() payload): Promise<any> {
  //   if (payload.id_token) {
  //     return await this.authService.registerByIDtoken(payload);
  //   }
  //   throw new UnauthorizedException('Unauthorized');
  // }
}

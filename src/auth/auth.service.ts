import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  KakaoSignUpResponseDTO,
  KakaoLoginRequestDTO,
  KakaoLoginResponseDTO,
} from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthVendor } from './authVendor';
import { AuthKakaoService } from './auth.kakao.service';
import { toCamel } from 'snake-camel';
import { generateId } from '../common/util';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authKakaoService: AuthKakaoService,
  ) {}

  public async validateKakaoUser(
    accessToken: KakaoLoginRequestDTO,
  ): Promise<KakaoLoginResponseDTO | KakaoSignUpResponseDTO> {
    const kakaoInfo = await this.authKakaoService.validateKakaoUser(
      accessToken,
    );

    const id = generateId(AuthVendor.KAKAO, kakaoInfo['id']);
    const userOrNone = await this.userService.getUser(id);
    const payload = { id: id };

    if (userOrNone.isSome()) {
      return new KakaoLoginResponseDTO(this.jwtService.sign(payload));
    } else {
      return new KakaoSignUpResponseDTO(
        this.jwtService.sign(payload),
        toCamel(kakaoInfo),
      );
    }
  }
}

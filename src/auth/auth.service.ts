import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authKakaoService: AuthKakaoService,
  ) {}

  public async validateKakaoUser(
    accessToken: KakaoLoginRequestDTO,
  ): Promise<KakaoLoginResponseDTO | KakaoSignUpResponseDTO> {
    const kakaoInfo = await this.authKakaoService.getKakaoInfo(accessToken);

    const id = generateId(AuthVendor.KAKAO, kakaoInfo['id']);
    const userOrNone = await this.userService.getUser(id);
    const payload = { id: id };

    if (userOrNone.isSome()) {
      return new KakaoLoginResponseDTO(this.jwtService.sign(payload));
    } else {
      return new KakaoSignUpResponseDTO(
        await this.jwtService.sign(payload),
        toCamel(kakaoInfo),
      );
    }
  }

  async registerByIDtoken(payload: any) {
    if (payload.hasOwnProperty('id_token')) {
      let email, firstName, lastName = '';

      //You can decode the id_token which returned from Apple,
      const decodedObj = await this.jwtService.decode(payload.id_token);
      const accountId = decodedObj.sub || '';
      console.info(`Apple Account ID: ${accountId}`);

      //Email address
      if (decodedObj.hasOwnProperty('email')) {
        email = decodedObj['email'];
        console.info(`Apple Email: ${email}`);
      }

      //You can also extract the firstName and lastName from the user, but they are only shown in the first time.
      if (payload.hasOwnProperty('user')) {
        const userData = JSON.parse(payload.user);
        const { firstName, lastName } = userData.name || {};
      }

      //.... you logic for registration and login here

    }
    throw new UnauthorizedException('Unauthorized');
  }
}

import { Injectable } from '@nestjs/common';
import {
  AppleLoginResponseDTO,
  AppleSignUpResponseDTO,
  KakaoLoginRequestDTO,
  KakaoLoginResponseDTO,
  KakaoSignUpResponseDTO,
} from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthVendor } from './authVendor';
import { AuthKakaoService } from './auth.kakao.service';
import { toCamel } from 'snake-camel';
import { generateId } from '../common/util';
import { JwksClient } from 'jwks-rsa';

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

  public async validateAppleUser(
    idToken: string,
  ): Promise<AppleLoginResponseDTO | AppleSignUpResponseDTO> {
    const decodedToken = this.jwtService.decode(idToken, { complete: true });
    const keyIdFromToken = decodedToken['header'].kid;
    const applePublicKeyUrl = 'https://appleid.apple.com/auth/keys';
    const jwksClient = new JwksClient({ jwksUri: applePublicKeyUrl });
    const key = await jwksClient.getSigningKey(keyIdFromToken);
    const publicKey = await key.getPublicKey();

    const appleInfo = this.jwtService.verify(idToken, {
      publicKey: publicKey,
      algorithms: [decodedToken['header'].alg],
    });
    const id = generateId(AuthVendor.APPLE, appleInfo.sub);
    const userOrNone = await this.userService.getUser(id);
    const payload = { id: id };

    if (userOrNone.isSome()) {
      return new AppleLoginResponseDTO(this.jwtService.sign(payload));
    } else {
      return new AppleSignUpResponseDTO(
        await this.jwtService.sign(payload),
        toCamel(appleInfo),
      );
    }
  }
}

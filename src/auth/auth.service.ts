import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { firstValueFrom, map } from 'rxjs';
import {
  KakaoSignUpResponseDTO,
  KakaoLoginRequestDTO,
  KakaoLoginResponseDTO,
} from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthVendor } from './authVendor';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  public async validateKakaoUser(
    accessToken: KakaoLoginRequestDTO,
  ): Promise<KakaoLoginResponseDTO | KakaoSignUpResponseDTO> {
    try {
      const response = (
        await firstValueFrom(
          this.httpService
            .get('https://kapi.kakao.com/v2/user/me', {
              method: 'GET',
              headers: { Authorization: `Bearer ${accessToken}` },
            })
            .pipe(map((response) => [response.data, response.status])),
        )
      )[0];

      /*
       *   User 컬렉션에 `response.id` 존재하는지 확인
       * */
      const id = this.userService.generateId(AuthVendor.KAKAO, response.id);
      const userOrNone = await this.userService.getUser(id);
      const payload = { id: id };

      if (userOrNone.isSome()) {
        return new KakaoLoginResponseDTO(this.jwtService.sign(payload));
      } else {
        return new KakaoSignUpResponseDTO(
          this.jwtService.sign(payload),
          response,
        );
      }
    } catch {
      throw new HttpException('토큰 똑바로 주십쇼', HttpStatus.UNAUTHORIZED);
    }
  }
}

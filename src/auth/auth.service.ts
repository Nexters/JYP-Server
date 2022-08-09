import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import {
  KakaoSignUpResponseDTO,
  KakaoLoginRequestDTO,
  KakaoLoginResponseDTO,
} from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  public async validateKakaoUser({
    accessToken,
  }: KakaoLoginRequestDTO): Promise<
    KakaoLoginResponseDTO | KakaoSignUpResponseDTO
  > {
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
      const user = false;

      if (user) {
        return new KakaoLoginResponseDTO(
          this.jwtService.sign({ payLoad: response.id }),
        );
      } else {
        return new KakaoSignUpResponseDTO(
          this.jwtService.sign({ payLoad: response.id }),
          response,
        );
      }
    } catch {
      throw new HttpException('토큰 똑바로 주십쇼', HttpStatus.UNAUTHORIZED);
    }
  }
}

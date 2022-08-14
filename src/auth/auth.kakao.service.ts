import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { KakaoLoginRequestDTO, KakaoLoginResponseDTO } from './dto/auth.dto';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class AuthKakaoService {
  constructor(private httpService: HttpService) {}

  public async validateKakaoUser(
    accessToken: KakaoLoginRequestDTO,
  ): Promise<KakaoLoginResponseDTO> {
    try {
      return (
        await firstValueFrom(
          this.httpService
            .get('https://kapi.kakao.com/v2/user/me', {
              method: 'GET',
              headers: { Authorization: `${accessToken}` },
            })
            .pipe(map((response) => [response.data, response.status])),
        )
      )[0];
    } catch (e) {
      throw new UnauthorizedException(e.response.data.msg, '카카오 토큰');
    }
  }
}

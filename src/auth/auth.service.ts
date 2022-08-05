import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { KakaoInformationResponseDTO, KakaoLoginRequestDTO } from './dto/authValidation';
import { JwtService } from '@nestjs/jwt'

const REST_API_KEY = process.env.DEV_KAKAO_REST_API_KEY;
const REDIRECT_URI = process.env.DEV_KAKAO_REDIRECT_URI;

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService, private readonly jwtService: JwtService ) {}

  // TODO: 사용하지 않음
  public async getAuthToken(): Promise<object> {
    return await firstValueFrom(this.httpService.get(`https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`, {
      headers: { 'Content-Type': 'x-www-form-urlencoded' },
    }).pipe(map(response => [response.data, response.status])));
  }

  public async validateKakaoUser({accessToken}: KakaoLoginRequestDTO): Promise<object> {
    try {
      const response: KakaoInformationResponseDTO = (await firstValueFrom(this.httpService.get('https://kapi.kakao.com/v2/user/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }).pipe(map(response => [response.data, response.status]))))[0];

        /*
        *   User 컬렉션에 `response.id` 존재하는지 확인
        * */
      const user = true;

      // TODO: 응답 포맷 정의해야 함
      // TODO: 최초 로그인이 아니라면?
      if (user) {
        return {
          token: this.jwtService.sign({payLoad: response.id}),
          data: {}
        }
      } else {     // TODO: 최초 로그인이라면?
        return {
          token: this.jwtService.sign({payLoad: response.id}),
          data: response
        }
      }
    } catch {
      throw new HttpException('토큰 똑바로 주십쇼', HttpStatus.UNAUTHORIZED);
    }



  }

  public async getKakaoUserInformation(accessToken: string): Promise<KakaoInformationResponseDTO> {
    // const token = this.jwtService.decode(accessToken)
    try {
      const response: KakaoInformationResponseDTO = (await firstValueFrom(this.httpService.get('https://kapi.kakao.com/v2/user/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }).pipe(map(response => [response.data, response.status]))))[0];
      return response;
    } catch (e) {
      throw new Error(e);
    }
  }

  public async tokenValidateUser(payload: any): Promise<any> {
    return 'test123'
  }
}

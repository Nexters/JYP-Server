import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { KakaoInformationResponseDTO, KakaoLoginRequestDTO } from './auth.dto/authValidation';
import { JwtService } from '@nestjs/jwt'

const REST_API_KEY = process.env.DEV_KAKAO_REST_API_KEY;
const REDIRECT_URI = process.env.DEV_KAKAO_REDIRECT_URI;

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService, private readonly jwtService: JwtService) {}

  public async authTest(): Promise<string> {
    return 'testeq';
  }

  // TODO: 사용하지 않음
  public async getAuthToken(): Promise<object> {
    return await firstValueFrom(this.httpService.get(`https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`, {
      headers: { 'Content-Type': 'x-www-form-urlencoded' },
    }).pipe(map(response => [response.data, response.status])));
  }

  public async kakaoValidateUser({accessToken}: KakaoLoginRequestDTO): Promise<string> {
    const response: KakaoInformationResponseDTO = (await firstValueFrom(this.httpService.get('https://kapi.kakao.com/v2/user/me', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }).pipe(map(response => [response.data, response.status]))))[0];
    return this.jwtService.sign({payLoad: response.id});
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

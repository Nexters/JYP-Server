import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
const REST_API_KEY = process.env.DEV_KAKAO_REST_API_KEY;
const REDIRECT_URI = process.env.DEV_KAKAO_REDIRECT_URI;

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {
  }
  authTest(): string {
    return 'Auth Test'
  }

  // TODO: 사용하지 않을 예정
  public async getAuthToken(): Promise<object> {
    return await firstValueFrom(this.httpService.get(`https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`, {
      headers: {'Content-Type': 'x-www-form-urlencoded'}
    }).pipe(map(response => [response.data, response.status]),));
  }

  public async kakaoLogin(query: string): Promise<any> {
    return 'ok';
  }

  public async getKakaoUserInformation(accessToken: string): Promise<any> {
    const response: object = await firstValueFrom(this.httpService.get('https://kapi.kakao.com/v2/user/me', {
      method: "GET",
      headers: { "Authorization": `Bearer ${accessToken}` }
    }).pipe(map(response => [response.data, response.status])));
    const NETWORK_SUCCESS_STATUS_CODE = 200;
    try {
      if (response[1] === NETWORK_SUCCESS_STATUS_CODE) {
        return response;
      } else {
        return "kakao login openAPI error: " + response["statusText"];
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}

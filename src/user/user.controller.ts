import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserDTO, UserUpdateDTO } from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiTags('User')
  @ApiOperation({
    summary: '유저 정보 조회',
    description: '유저 ID로 유저 정보를 조회한다.',
  })
  @ApiOkResponse({ description: '성공', type: UserDTO })
  @ApiNotFoundResponse({ description: '유저를 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @Get(':id')
  public async getUser(@Param('id') id: string): Promise<UserDTO> {
    return await this.userService.getUser(id);
  }

  @ApiTags('User')
  @ApiOperation({
    summary: '유저 정보 수정',
    description: '유저 닉네임 혹은 프로필 사진을 수정한다.',
  })
  @ApiOkResponse({ description: '성공', type: UserDTO })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @Patch(':id')
  public async updateUser(
    @Param('id') id: string,
    @Body() userUpdateDTO: UserUpdateDTO,
  ): Promise<UserDTO> {
    return await this.userService.updateUser(id, userUpdateDTO);
  }
}

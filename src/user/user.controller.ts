import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Option } from 'prelude-ts';
import jwt from 'jsonwebtoken';
import {
  UserCreateRequestDTO,
  UserDeleteResponseDTO,
  UserResponseDTO,
  UserUpdateRequestDTO,
} from './dtos/user.dto';
import { UserService } from './user.service';
import { Environment } from '../common/environment';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiTags('User')
  @ApiOperation({
    summary: '유저 정보 조회',
    description: '유저 ID로 유저 정보를 조회한다.',
  })
  @ApiOkResponse({ description: '성공', type: UserResponseDTO })
  @ApiNotFoundResponse({ description: '유저를 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  public async getUser(@Param('id') id: string): Promise<UserResponseDTO> {
    const userDTO: Option<UserResponseDTO> = await this.userService.getUser(id);
    return userDTO.getOrThrow(new NotFoundException());
  }

  @ApiTags('User')
  @ApiOperation({
    summary: '유저 정보 조회',
    description: '클라이언트의 헤더로 유저 정보를 조회한다.',
  })
  @ApiOkResponse({ description: '성공', type: UserResponseDTO })
  @ApiNotFoundResponse({ description: '유저를 찾을 수 없음' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  public async getUserByJwt(@Headers() headers): Promise<any> {
    console.info(headers['authorization'].replace('Bearer ', ''));
    console.info(process.env.ENV);
    const token: string = headers['authorization'].replace('Bearer ', '');
    const userDTO: Option<UserResponseDTO> = await this.userService.getUser(
      process.env.ENV == Environment.PRODUCTION
        ? jwt.verify(token, process.env.JWT_PRIVATE_KEY)['id']
        : jwt.decode(token)['id'],
    );
    return userDTO.getOrThrow(new NotFoundException());
  }

  @ApiTags('User')
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 유저를 생성한다.',
  })
  @ApiCreatedResponse({ description: '성공', type: UserResponseDTO })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  public async createUser(
    @Body() userCreateDTO: UserCreateRequestDTO,
    @Request() req,
  ): Promise<UserResponseDTO> {
    return await this.userService.createUser(userCreateDTO, req.user.id);
  }

  @ApiTags('User')
  @ApiOperation({
    summary: '유저 정보 수정',
    description: '유저 이름 혹은 프로필 사진을 수정한다.',
  })
  @ApiOkResponse({ description: '성공', type: UserResponseDTO })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  public async updateUser(
    @Param('id') id: string,
    @Body() userUpdateDTO: UserUpdateRequestDTO,
  ): Promise<UserResponseDTO> {
    return await this.userService.updateUser(id, userUpdateDTO);
  }

  @ApiTags('User')
  @ApiOperation({
    summary: '유저 정보 삭제',
    description: '유저 정보를 삭제한다.',
  })
  @ApiOkResponse({ description: '성공', type: UserDeleteResponseDTO })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  public async deleteUser(
    @Param('id') id: string,
  ): Promise<UserDeleteResponseDTO> {
    return await this.userService.deleteUser(id);
  }
}

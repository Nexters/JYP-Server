import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TimeRangeValidationPipe } from '../common/pipe/custom.validation.pipe';
import {
  JourneyCreateRequestDTO,
  IdResponseDTO,
  PikmiCreateRequestDTO,
  PikisUpdateRequestDTO,
  IdsResponseDTO,
  TagsUpdateRequestDTO,
  JourneyListResponseDTO,
} from './dtos/journey.dto';
import { JourneyService } from './journey.service';

@ApiTags('Journey')
@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @ApiOperation({
    summary: '유저의 여행 목록',
    description: '유저가 속한 모든 여행을 가져온다.',
  })
  @ApiOkResponse({ description: '성공', type: JourneyListResponseDTO })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  public async listUserJourneys(
    @Request() req,
  ): Promise<JourneyListResponseDTO> {
    return await this.journeyService.listUserJourneys(req.user.id);
  }

  @ApiOperation({
    summary: '여행 생성',
    description: '새로운 여행을 생성한다.',
  })
  @ApiCreatedResponse({ description: '성공', type: IdResponseDTO })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new TimeRangeValidationPipe())
  @Post()
  public async createJourney(
    @Body() journeyCreateDto: JourneyCreateRequestDTO,
    @Request() req,
  ): Promise<IdResponseDTO> {
    return await this.journeyService.createJourney(
      journeyCreateDto,
      req.user.id,
    );
  }

  @ApiOperation({
    summary: '픽미 추가',
    description: '검색을 통해 선택된 픽미를 여행에 추가한다.',
  })
  @ApiCreatedResponse({ description: '성공', type: IdResponseDTO })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':journeyId/pikmis')
  public async createPikmi(
    @Param('journeyId') journeyId: string,
    @Body() pikmiCreateDto: PikmiCreateRequestDTO,
    @Request() req,
  ): Promise<IdResponseDTO> {
    return await this.journeyService.createPikmi(
      pikmiCreateDto,
      journeyId,
      req.user.id,
    );
  }

  @ApiOperation({
    summary: '피키 수정',
    description: '추가 혹은 수정된 피키 목록을 여행에 반영한다.',
  })
  @ApiOkResponse({ description: '성공' })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post(':journeyId/pikis')
  public async updatePiki(
    @Param('journeyId') journeyId: string,
    @Body() pikisUpdateDto: PikisUpdateRequestDTO,
    @Request() req,
  ): Promise<IdsResponseDTO> {
    return await this.journeyService.updatePiki(
      pikisUpdateDto,
      journeyId,
      req.user.id,
    );
  }

  @ApiOperation({
    summary: '태그 수정',
    description: '유저가 추가 혹은 수정한 태그를 여행에 반영한다.',
  })
  @ApiOkResponse({ description: '성공' })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post(':journeyId/tags')
  public async updateTags(
    @Param('journeyId') journeyId: string,
    @Body() tagsUpdateDto: TagsUpdateRequestDTO,
    @Request() req,
  ): Promise<void> {
    await this.journeyService.updateTags(tagsUpdateDto, journeyId, req.user.id);
  }

  @ApiOperation({
    summary: '저니에 유저 추가',
    description: '새로운 유저를 저니에 추가한다.',
  })
  @ApiOkResponse({ description: '성공' })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post(':journeyId/join')
  public async addUserToJourney(
    @Param('journeyId') journeyId: string,
    @Body() tagsUpdateDto: TagsUpdateRequestDTO,
    @Request() req,
  ): Promise<void> {
    await this.journeyService.addUserToJourney(journeyId, req.user.id);
    await this.journeyService.updateTags(tagsUpdateDto, journeyId, req.user.id);
  }

  @ApiOperation({
    summary: '저니에서 유저 삭제',
    description:
      '저니에서 유저를 삭제한다. 유저가 추가한 태그 및 피키 좋아요도 삭제된다.',
  })
  @ApiOkResponse({ description: '성공' })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post(':journeyId/drop')
  public async deleteUserFromJourney(
    @Param('journeyId') journeyId: string,
    @Request() req,
  ): Promise<void> {
    await this.journeyService.deleteUserFromJourney(journeyId, req.user.id);
  }

  @ApiOperation({
    summary: '픽미에 좋아요 추가',
    description: '픽미에 요청한 유저 ID로 좋아요를 추가한다.',
  })
  @ApiOkResponse({ description: '성공' })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post(':journeyId/pikmis/:pikmiId/likes')
  public async addLikesToPikmi(
    @Param('journeyId') journeyId: string,
    @Param('pikmiId') pikmiId: string,
    @Request() req,
  ): Promise<void> {
    await this.journeyService.addLikesToPikmi(journeyId, pikmiId, req.user.id);
  }

  @ApiOperation({
    summary: '픽미에서 좋아요 삭제',
    description: '픽미에서 요청한 유저 ID의 좋아요를 삭제한다.',
  })
  @ApiOkResponse({ description: '성공' })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
  @ApiUnauthorizedResponse({ description: '인증 실패' })
  @ApiInternalServerErrorResponse({ description: '서버 오류' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post(':journeyId/pikmis/:pikmiId/undoLikes')
  public async deleteLikesFromPikmi(
    @Param('journeyId') journeyId: string,
    @Param('pikmiId') pikmiId: string,
    @Request() req,
  ): Promise<void> {
    await this.journeyService.deleteLikesFromPikmi(
      journeyId,
      pikmiId,
      req.user.id,
    );
  }
}

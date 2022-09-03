import {
  Body,
  Controller,
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
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TimeRangeValidationPipe } from '../common/pipe/custom.validation.pipe';
import {
  JourneyCreateDTO,
  IdResponseDTO,
  PikmiCreateDTO,
} from './dtos/journey.dto';
import { JourneyService } from './journey.service';

@ApiTags('Journey')
@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

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
    @Body() journeyCreateDto: JourneyCreateDTO,
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
    @Body() pikmiCreateDto: PikmiCreateDTO,
    @Request() req,
  ): Promise<IdResponseDTO> {
    return await this.journeyService.createPikmi(
      pikmiCreateDto,
      journeyId,
      req.user.id,
    );
  }
}

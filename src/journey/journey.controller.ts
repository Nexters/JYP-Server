import {
  Body,
  Controller,
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
} from '@nestjs/swagger';
import { TimeRangeValidationPipe } from '../common/pipe/custom.validation.pipe';
import { JourneyCreateDTO, IdResponseDTO } from './dtos/journey.dto';
import { JourneyService } from './journey.service';

@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @ApiTags('Journey')
  @ApiOperation({
    summary: '여행 생성',
    description: '새로운 여행을 생성한다.',
  })
  @ApiCreatedResponse({ description: '성공', type: IdResponseDTO })
  @ApiBadRequestResponse({ description: '요청 데이터가 잘못됨' })
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
}

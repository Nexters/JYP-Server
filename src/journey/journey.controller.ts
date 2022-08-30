import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TimeRangeValidationPipe } from '../common/pipe/custom.validation.pipe';
import { JourneyCreateDto, IdResponseDto } from './dtos/journey.dto';
import { JourneyService } from './journey.service';

@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new TimeRangeValidationPipe())
  @Post()
  public async createJourney(
    @Body() journeyCreateDto: JourneyCreateDto,
    @Request() req,
  ): Promise<IdResponseDto> {
    return await this.journeyService.createJourney(
      journeyCreateDto,
      req.user.id,
    );
  }
}

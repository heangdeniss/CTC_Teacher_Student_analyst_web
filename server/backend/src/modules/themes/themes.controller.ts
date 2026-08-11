import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { FilterQueryDto } from '../../common/filters';
import { ThemesService } from './themes.service';

@Controller('api/themes')
export class ThemesController {
  constructor(private readonly themes: ThemesService) {}

  /** Ranked meaningful themes for one question type. */
  @Get()
  getThemes(
    @Query() filters: FilterQueryDto,
    @Query('questionType') questionType: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.themes.getThemeRanking(filters, questionType, limit);
  }

  @Get('question-types')
  getQuestionTypes() {
    return this.themes.getQuestionTypes();
  }

  /** Documents which themes are excluded from analysis and why. */
  @Get('exclusions')
  getExclusions() {
    return this.themes.getExclusions();
  }
}

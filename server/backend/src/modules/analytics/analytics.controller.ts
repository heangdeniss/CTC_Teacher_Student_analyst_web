import { Controller, Get, Query } from '@nestjs/common';
import { FilterQueryDto } from '../../common/filters';
import { AnalyticsService } from './analytics.service';

@Controller('api')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('overview')
  getOverview(@Query() filters: FilterQueryDto) {
    return this.analytics.getOverview(filters);
  }

  @Get('profile')
  getProfile(@Query() filters: FilterQueryDto) {
    return this.analytics.getProfile(filters);
  }

  @Get('impact')
  getImpact(@Query() filters: FilterQueryDto) {
    return this.analytics.getImpact(filters);
  }

  @Get('digital-skills')
  getDigitalSkills(@Query() filters: FilterQueryDto) {
    return this.analytics.getDigitalSkills(filters);
  }

  @Get('learning-experience')
  getExperience(@Query() filters: FilterQueryDto) {
    return this.analytics.getExperience(filters);
  }

  @Get('risk')
  getRisk(@Query() filters: FilterQueryDto) {
    return this.analytics.getRisk(filters);
  }

  @Get('headline')
  getHeadline(@Query() filters: FilterQueryDto) {
    return this.analytics.getHeadline(filters);
  }
}

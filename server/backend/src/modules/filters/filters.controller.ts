import { Controller, Get } from '@nestjs/common';
import { FiltersService } from './filters.service';

@Controller('api/filters')
export class FiltersController {
  constructor(private readonly filters: FiltersService) {}

  @Get('options')
  getOptions() {
    return this.filters.getOptions();
  }
}

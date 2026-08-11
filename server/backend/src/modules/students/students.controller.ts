import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { FilterQueryDto } from '../../common/filters';
import { StudentsService } from './students.service';

@Controller('api/students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  list(
    @Query() filters: FilterQueryDto,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.students.list(filters, Math.min(limit, 500), offset);
  }

  @Get('data-quality')
  getDataQuality() {
    return this.students.getDataQuality();
  }
}

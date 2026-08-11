import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FiltersModule } from './modules/filters/filters.module';
import { StudentsModule } from './modules/students/students.module';
import { ThemesModule } from './modules/themes/themes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AnalyticsModule,
    ThemesModule,
    StudentsModule,
    FiltersModule,
  ],
})
export class AppModule {}

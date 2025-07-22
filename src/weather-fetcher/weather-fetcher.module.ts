import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherFetcherService } from './weather-fetcher.service';

@Module({
  imports: [HttpModule],
  providers: [WeatherFetcherService],
  exports: [WeatherFetcherService]
})
export class WeatherFetcherModule {}

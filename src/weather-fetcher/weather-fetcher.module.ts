import { Module } from '@nestjs/common';
import { WeatherFetcherService } from './weather-fetcher.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [WeatherFetcherService]
})
export class WeatherFetcherModule {}

import { Module } from '@nestjs/common';
import { WeatherFetcherModule } from '../weather-fetcher/weather-fetcher.module';
import { GeocoderModule } from '../geocoder/gecoder.module';
import { RegressionModule } from '../regression/regression.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { WeatherService } from './weather.service';
import { WeatherResolver } from './weather.resolver';

@Module({
  imports: [
    WeatherFetcherModule,
    GeocoderModule,
    RegressionModule,
    RateLimitModule
  ],
  providers: [WeatherService, WeatherResolver]
})
export class WeatherModule {}

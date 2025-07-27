import { Module } from '@nestjs/common';
import { WeatherFetcherModule } from '../weather-fetcher/weather-fetcher.module';
import { GeocoderModule } from '../geocoder/gecoder.module';
import { RegressionModule } from '../regression/regression.module';
import { WeatherService } from './weather.service';
import { WeatherResolver } from './weather.resolver';

@Module({
  imports: [WeatherFetcherModule, GeocoderModule, RegressionModule],
  providers: [WeatherService, WeatherResolver]
})
export class WeatherModule {}

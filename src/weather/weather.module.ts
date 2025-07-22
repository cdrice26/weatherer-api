import { Module } from '@nestjs/common';
import { WeatherFetcherModule } from 'src/weather-fetcher/weather-fetcher.module';
import { GeocoderModule } from 'src/geocoder/gecoder.module';
import { WeatherService } from './weather.service';
import { WeatherResolver } from './weather.resolver';

@Module({
  imports: [WeatherFetcherModule, GeocoderModule],
  providers: [WeatherService, WeatherResolver]
})
export class WeatherModule {}

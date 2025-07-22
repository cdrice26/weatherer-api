import { Injectable } from '@nestjs/common';
import { WeatherAnalysis } from '../graphql.schema';
import { WeatherFetcherService } from 'src/weather-fetcher/weather-fetcher.service';
import { GeocoderService } from 'src/geocoder/geocoder.service';

@Injectable()
export class WeatherService {
  private readonly weatherFetcherService = new WeatherFetcherService();
  private readonly geocoderService = new GeocoderService();

  async findAll(
    location,
    startYear,
    endYear,
    averageYears,
    fields: string[]
  ): Promise<WeatherAnalysis> {
    const { latitude, longitude } =
      await this.geocoderService.geocode(location);
    return this.weatherFetcherService.findAll(
      latitude,
      longitude,
      startYear,
      endYear,
      fields
    );
  }
}

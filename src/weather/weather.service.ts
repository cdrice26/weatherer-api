import { Injectable } from '@nestjs/common';
import { WeatherAnalysis } from '../graphql.schema';
import { WeatherFetcherService } from 'src/weather-fetcher/weather-fetcher.service';
import { GeocoderService } from 'src/geocoder/geocoder.service';

@Injectable()
export class WeatherService {
  constructor(
    private readonly weatherFetcherService: WeatherFetcherService,
    private readonly geocoderService: GeocoderService
  ) {}

  async findAll(
    location,
    startYear,
    endYear,
    averageYears,
    fields: string[]
  ): Promise<WeatherAnalysis> {
    const { latitude, longitude } =
      await this.geocoderService.geocode(location);
    const historicalData = await this.weatherFetcherService.findAll(
      latitude,
      longitude,
      startYear,
      endYear,
      averageYears,
      fields
    );
    return {
      historicalData,
      regression: {
        regressionType: 'linear',
        coefficients: [0.5, 1.2],
        rSquared: 0.95,
        testResults: {
          pValue: 0.01,
          significant: true,
          tStatistic: 2.5
        }
      }
    };
  }
}

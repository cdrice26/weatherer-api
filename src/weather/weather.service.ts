import { Injectable } from '@nestjs/common';
import { WeatherAnalysis } from '../graphql.schema';
import { WeatherFetcherService } from '../weather-fetcher/weather-fetcher.service';
import { GeocoderService } from '../geocoder/geocoder.service';
import { RegressionService } from '../regression/regression.service';

@Injectable()
export class WeatherService {
  constructor(
    private readonly weatherFetcherService: WeatherFetcherService,
    private readonly geocoderService: GeocoderService,
    private readonly regressionService: RegressionService
  ) {}

  async findAll(
    location: string,
    startYear: number,
    endYear: number,
    averageYears: number,
    fields: string[],
    regressionFields: string[],
    regressionDegree: number
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
    const regression = await this.regressionService.performRegression(
      historicalData,
      regressionDegree,
      regressionFields,
      0.05
    );
    return {
      historicalData,
      regression
    };
  }
}

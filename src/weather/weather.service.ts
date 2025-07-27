import { Injectable } from '@nestjs/common';
import { WeatherAnalysis } from '../graphql.schema';
import { WeatherFetcherService } from '../weather-fetcher/weather-fetcher.service';
import { GeocoderService } from '../geocoder/geocoder.service';
import { RegressionService } from '../regression/regression.service';

/**
 * Service for handling weather-related operations, including fetching historical data and performing analysis.
 */
@Injectable()
export class WeatherService {
  constructor(
    private readonly weatherFetcherService: WeatherFetcherService,
    private readonly geocoderService: GeocoderService,
    private readonly regressionService: RegressionService
  ) {}

  /**
   * Finds historical weather data for a specified location and performs regression analysis.
   *
   * @param {string} location - The location for which to fetch weather data.
   * @param {number} startYear - The starting year for the historical data.
   * @param {number} endYear - The ending year for the historical data.
   * @param {number} averageYears - The number of years to average the data over.
   * @param {string[]} fields - The fields to include in the weather data response.
   * @param {string[]} regressionFields - The fields to use for regression analysis.
   * @param {number} regressionDegree - The degree of the regression polynomial.
   * @returns {Promise<WeatherAnalysis>} - A promise that resolves to an object containing historical weather data and regression results.
   */
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

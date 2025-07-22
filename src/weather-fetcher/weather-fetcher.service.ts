import { Injectable } from '@nestjs/common';
import { WeatherAnalysis } from '../graphql.schema';

@Injectable()
export class WeatherFetcherService {
  private readonly weather: WeatherAnalysis = {
    historicalData: [
      {
        year: 2020,
        averageTemperature: 15.5,
        averageApparentTemperature: 16.0,
        precipitation: 120.5,
        snowfall: 30.0,
        maxWindSpeed: 25.0
      },
      {
        year: 2021,
        averageTemperature: 15.5,
        averageApparentTemperature: 16.0,
        precipitation: 120.5,
        snowfall: 30.0,
        maxWindSpeed: 25.0
      }
    ],
    regression: {
      coefficients: [0.5, 10],
      rSquared: 0.95,
      regressionType: 'linear',
      testResults: {
        pValue: 0.01,
        tStatistic: 2.5,
        significant: true
      }
    }
  };

  findAll(
    lat: number,
    lon: number,
    startYear: number,
    endYear: number,
    fields: string[]
  ): WeatherAnalysis {
    return this.weather;
  }
}

import { Injectable } from '@nestjs/common';
import { WeatherAnalysis } from '../graphql.schema';

@Injectable()
export class WeatherService {
  private readonly weather: WeatherAnalysis = {
    historicalData: [
      {
        year: 2020,
        averageTemperature: 15.5,
        averageApparentTemperature: 16.0,
        precipitation: 120.5,
        snowfall: 30.0,
        maxWindSpeed: 25.0
      }
    ],
    regression: {
      equation: 'y = 0.5x + 10',
      rSquared: 0.95,
      regressionType: 'linear',
      testResults: {
        pValue: 0.01,
        tStatistic: 2.5,
        significant: true
      }
    }
  };

  findAll(): WeatherAnalysis {
    return this.weather;
  }
}

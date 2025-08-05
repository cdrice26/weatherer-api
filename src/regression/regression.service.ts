import { Injectable } from '@nestjs/common';
import {
  HistoricalMetricData,
  MetricRegression,
  WeatherMetric
} from '../graphql.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Service for performing regression analysis on historical weather data.
 */
@Injectable()
export class RegressionService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Performs regression analysis on the provided historical weather data.
   *
   * @param {HistoricalMetricData[]} data - The historical weather data to analyze.
   * @param {number} regressionDegree - The degree of the polynomial regression.
   * @param {WeatherMetric[]} fields - The fields to perform regression analysis on.
   * @param {number} alpha - The significance level for hypothesis testing.
   * @returns {Promise<Regression>} - A promise that resolves to the regression results.
   */
  async performRegression(
    data: HistoricalMetricData[],
    regressionDegree: number,
    fields: WeatherMetric[],
    alpha: number
  ): Promise<MetricRegression[]> {
    try {
      const promises = fields.map(async (field) => {
        const relevantData = data
          .filter((item) => item.metric === field)
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        const dates = relevantData.map((item) => item.date);
        const baseTime = Math.min(...dates.map((date) => date.getTime()));
        const fieldData = relevantData.map((item) => item.value);
        const response = await firstValueFrom(
          this.httpService.post(process.env.REGRESSION_API_URL, {
            x: dates.map(
              (date) => (date.getTime() - baseTime) / (1000 * 60 * 60 * 24)
            ),
            y: fieldData,
            degree: regressionDegree
          })
        );

        const result = response.data;

        return {
          metric: field,
          results: {
            coefficients: result.coefficients,
            baseDate: new Date(baseTime),
            rSquared: result.r_squared,
            testResults: {
              pValue: result.test_results.p_value,
              significant: result.test_results.p_value < alpha,
              fStatistic: result.test_results.f_stat
            }
          }
        };
      });
      const regressionResults = await Promise.all(promises);
      return regressionResults;
    } catch (e) {
      console.log(e);
      throw new Error('Failed to perform regression analysis.');
    }
  }
}

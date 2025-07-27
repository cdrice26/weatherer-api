import { Injectable } from '@nestjs/common';
import { HistoricalWeatherData, Regression } from 'src/graphql.schema';

/**
 * Service for performing regression analysis on historical weather data.
 */
@Injectable()
export class RegressionService {
  /**
   * Performs regression analysis on the provided historical weather data.
   *
   * @param {HistoricalWeatherData[]} data - The historical weather data to analyze.
   * @param {number} regressionDegree - The degree of the polynomial regression.
   * @param {string[]} fields - The fields to perform regression analysis on.
   * @param {number} alpha - The significance level for hypothesis testing.
   * @returns {Promise<Regression>} - A promise that resolves to the regression results.
   */
  async performRegression(
    data: HistoricalWeatherData[],
    regressionDegree: number,
    fields: string[],
    alpha: number
  ): Promise<Regression> {
    try {
      const promises = fields.map(async (field) => {
        const years = data.map((item) => item.year);
        const fieldData = data.map((item) => item[field]);
        const response = await fetch(process.env.REGRESSION_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            x: years,
            y: fieldData,
            degree: regressionDegree
          })
        });

        if (!response.ok) {
          throw new Error('Failed to perform regression analysis');
        }

        const result = await response.json();
        return {
          coefficients: result.coefficients,
          rSquared: result.r_squared,
          testResults: {
            pValue: result.test_results.p_value,
            significant: result.test_results.p_value < alpha,
            fStatistic: result.test_results.f_stat
          }
        };
      });
      const regressionResults = await Promise.all(promises);

      return Object.fromEntries(
        fields.map((field, index) => [field, regressionResults[index]])
      );
    } catch (e) {
      throw new Error('Failed to perform regression analysis.');
    }
  }
}

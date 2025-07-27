import { Injectable } from '@nestjs/common';
import { HistoricalWeatherData, Regression } from 'src/graphql.schema';

@Injectable()
export class RegressionService {
  async performRegression(
    data: HistoricalWeatherData[],
    regressionDegree: number,
    fields: string[],
    alpha: number
  ): Promise<Regression> {
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
      console.log(result);
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
  }
}

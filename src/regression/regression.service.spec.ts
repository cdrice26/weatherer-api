import { Test, TestingModule } from '@nestjs/testing';
import { RegressionService } from './regression.service';
import { HistoricalMetricData, WeatherMetric } from '../graphql.schema';

describe('RegressionService', () => {
  let service: RegressionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegressionService]
    }).compile();

    service = module.get<RegressionService>(RegressionService);
  });

  beforeEach(() => {
    // Clear any previous mocks
    global.fetch = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('performRegression', () => {
    const mockData: HistoricalMetricData[] = [
      {
        date: new Date('2020-01-01T00:00:00'),
        metric: WeatherMetric.AVERAGE_TEMPERATURE,
        value: 15.1
      },
      {
        date: new Date('2020-12-31T00:00:00'),
        metric: WeatherMetric.PRECIPITATION,
        value: 100
      },
      {
        date: new Date('2021-01-01T00:00:00'),
        metric: WeatherMetric.AVERAGE_TEMPERATURE,
        value: 15.5
      },
      {
        date: new Date('2021-12-31T00:00:00'),
        metric: WeatherMetric.PRECIPITATION,
        value: 120
      },
      {
        date: new Date('2022-01-01T00:00:00'),
        metric: WeatherMetric.AVERAGE_TEMPERATURE,
        value: 15.3
      },
      {
        date: new Date('2022-12-31T00:00:00'),
        metric: WeatherMetric.PRECIPITATION,
        value: 110
      }
    ];

    const regressionResultMock = {
      coefficients: [1.0, -0.2],
      r_squared: 0.92,
      test_results: {
        p_value: 0.04,
        f_stat: 9.81
      }
    };

    it('should perform regression and return result for one field', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => regressionResultMock
      });

      const result = await service.performRegression(
        mockData,
        2,
        [WeatherMetric.AVERAGE_TEMPERATURE],
        0.05
      );

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        process.env.REGRESSION_API_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.any(String)
        })
      );

      expect(
        result.find((item) => item.metric === WeatherMetric.AVERAGE_TEMPERATURE)
      ).toMatchObject({
        metric: WeatherMetric.AVERAGE_TEMPERATURE,
        results: {
          coefficients: [1.0, -0.2],
          rSquared: 0.92,
          testResults: {
            pValue: 0.04,
            significant: true,
            fStatistic: 9.81
          }
        }
      });
    });

    it('should handle multiple fields and responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => regressionResultMock
      });

      const result = await service.performRegression(
        mockData,
        2,
        [WeatherMetric.AVERAGE_TEMPERATURE, WeatherMetric.PRECIPITATION],
        0.05
      );

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toContainEqual(
        expect.objectContaining({ metric: WeatherMetric.AVERAGE_TEMPERATURE })
      );
      expect(result).toContainEqual(
        expect.objectContaining({ metric: WeatherMetric.PRECIPITATION })
      );
    });

    it('should throw error if fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      await expect(
        service.performRegression(
          mockData,
          2,
          [WeatherMetric.AVERAGE_TEMPERATURE],
          0.05
        )
      ).rejects.toThrow('Failed to perform regression analysis');
    });
  });
});

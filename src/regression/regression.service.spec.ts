import { Test, TestingModule } from '@nestjs/testing';
import { RegressionService } from './regression.service';
import { HistoricalMetricData, WeatherMetric } from '../graphql.schema';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('RegressionService', () => {
  let service: RegressionService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn()
  };

  beforeEach(async () => {
    mockHttpService.post.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegressionService,
        {
          provide: HttpService,
          useValue: mockHttpService
        }
      ]
    }).compile();

    service = module.get<RegressionService>(RegressionService);
    httpService = module.get<HttpService>(HttpService);
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
      data: {
        coefficients: [1.0, -0.2],
        r_squared: 0.92,
        test_results: {
          p_value: 0.04,
          f_stat: 9.81
        }
      }
    };

    it('should perform regression and include baseDate in response', async () => {
      mockHttpService.post.mockReturnValueOnce(of(regressionResultMock));

      const result = await service.performRegression(
        mockData,
        2,
        [WeatherMetric.AVERAGE_TEMPERATURE],
        0.05
      );

      const tempData = mockData.filter(
        (d) => d.metric === WeatherMetric.AVERAGE_TEMPERATURE
      );
      const expectedBaseDate = new Date(
        Math.min(...tempData.map((d) => d.date.getTime()))
      );

      expect(mockHttpService.post).toHaveBeenCalledTimes(1);

      expect(result[0]).toMatchObject({
        metric: WeatherMetric.AVERAGE_TEMPERATURE,
        results: {
          coefficients: [1.0, -0.2],
          rSquared: 0.92,
          testResults: {
            pValue: 0.04,
            significant: true,
            fStatistic: 9.81
          },
          baseDate: expectedBaseDate
        }
      });
    });

    it('should handle multiple fields and responses with baseDate', async () => {
      mockHttpService.post
        .mockReturnValueOnce(of(regressionResultMock))
        .mockReturnValueOnce(of(regressionResultMock));

      const result = await service.performRegression(
        mockData,
        2,
        [WeatherMetric.AVERAGE_TEMPERATURE, WeatherMetric.PRECIPITATION],
        0.05
      );

      expect(mockHttpService.post).toHaveBeenCalledTimes(2);

      const averageTempResult = result.find(
        (r) => r.metric === WeatherMetric.AVERAGE_TEMPERATURE
      );
      const precipitationResult = result.find(
        (r) => r.metric === WeatherMetric.PRECIPITATION
      );

      expect(averageTempResult?.results.baseDate).toEqual(
        new Date('2020-01-01T00:00:00')
      );
      expect(precipitationResult?.results.baseDate).toEqual(
        new Date('2020-12-31T00:00:00')
      );
    });

    it('should throw error if fetch fails', async () => {
      mockHttpService.post.mockReturnValueOnce(
        throwError(() => new Error('Failed to perform regression analysis'))
      );

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

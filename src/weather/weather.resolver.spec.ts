import { Test, TestingModule } from '@nestjs/testing';
import { WeatherResolver } from './weather.resolver';
import { WeatherService } from './weather.service';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { GraphQLError } from 'graphql';
import { WeatherAnalysis, WeatherMetric } from '../graphql.schema';

describe('WeatherResolver', () => {
  let resolver: WeatherResolver;
  let weatherService: WeatherService;

  const mockWeatherService = {
    findAll: jest.fn()
  };

  const mockRateLimitService = {
    isUnderLimit: jest.fn(() => true)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherResolver,
        { provide: WeatherService, useValue: mockWeatherService },
        { provide: RateLimitService, useValue: mockRateLimitService }
      ]
    }).compile();

    resolver = module.get<WeatherResolver>(WeatherResolver);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  const mockInput = {
    location: 'New York',
    startYear: 2020,
    endYear: 2022,
    averageYears: 3,
    regressionDegree: 2,
    metrics: [WeatherMetric.AVERAGE_TEMPERATURE, WeatherMetric.PRECIPITATION]
  };

  const mockResult: WeatherAnalysis = {
    historicalData: [
      {
        metric: WeatherMetric.AVERAGE_TEMPERATURE,
        date: new Date('2020-01-01T00:00:00'),
        value: 14.3
      },
      {
        metric: WeatherMetric.PRECIPITATION,
        date: new Date('2020-12-31T00:00:00'),
        value: 120.0
      }
    ],
    regression: [
      {
        metric: WeatherMetric.AVERAGE_TEMPERATURE,
        results: {
          coefficients: [1.2, -0.3],
          rSquared: 0.95,
          testResults: {
            pValue: 0.03,
            significant: true,
            fStatistic: 10.4
          }
        }
      },
      {
        metric: WeatherMetric.PRECIPITATION,
        results: {
          coefficients: [0.8],
          rSquared: 0.87,
          testResults: {
            pValue: 0.05,
            significant: true,
            fStatistic: 9.2
          }
        }
      }
    ],
    locationName: 'Location'
  };

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return weather analysis from service', async () => {
    mockWeatherService.findAll.mockResolvedValue(mockResult);
    mockRateLimitService.isUnderLimit.mockReturnValue(true);

    const result = await resolver.getWeatherAnalysis(mockInput);

    expect(mockRateLimitService.isUnderLimit).toHaveBeenCalled();
    expect(mockWeatherService.findAll).toHaveBeenCalledWith(
      mockInput.location,
      mockInput.startYear,
      mockInput.endYear,
      mockInput.averageYears,
      mockInput.regressionDegree,
      [WeatherMetric.AVERAGE_TEMPERATURE, WeatherMetric.PRECIPITATION]
    );

    expect(result).toEqual(mockResult);
  });

  it('should throw GraphQLError if service throws', async () => {
    mockRateLimitService.isUnderLimit.mockReturnValue(true);
    mockWeatherService.findAll.mockRejectedValue(new Error('Service exploded'));

    await expect(resolver.getWeatherAnalysis(mockInput)).rejects.toThrow(
      GraphQLError
    );

    await expect(resolver.getWeatherAnalysis(mockInput)).rejects.toMatchObject({
      message: 'Unexpected error during weather analysis',
      extensions: { code: 'WEATHER_ANALYSIS_FAILED' }
    });
  });

  it('should throw GraphQLError if rate limit is exceeded', async () => {
    mockRateLimitService.isUnderLimit.mockReturnValue(false);
    mockWeatherService.findAll.mockClear();

    await expect(resolver.getWeatherAnalysis(mockInput)).rejects.toMatchObject({
      message: 'Daily weather API call limit reached',
      extensions: { code: 'RATE_LIMIT_EXCEEDED' }
    });

    expect(mockWeatherService.findAll).not.toHaveBeenCalled();
  });
});

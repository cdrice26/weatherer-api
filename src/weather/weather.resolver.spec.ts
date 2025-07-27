import { Test, TestingModule } from '@nestjs/testing';
import { WeatherResolver } from './weather.resolver';
import { WeatherService } from './weather.service';
import { GraphQLError } from 'graphql';
import { GraphQLResolveInfo } from 'graphql';
import { WeatherAnalysis } from '../graphql.schema';

describe('WeatherResolver', () => {
  let resolver: WeatherResolver;
  let weatherService: WeatherService;

  const mockWeatherService = {
    findAll: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherResolver,
        { provide: WeatherService, useValue: mockWeatherService }
      ]
    }).compile();

    resolver = module.get<WeatherResolver>(WeatherResolver);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  const mockInfo = {
    fieldNodes: [
      {
        selectionSet: {
          selections: [
            {
              kind: 'Field',
              name: { value: 'historicalData' },
              selectionSet: {
                selections: [
                  { kind: 'Field', name: { value: 'averageTemperature' } }
                ]
              }
            },
            {
              kind: 'Field',
              name: { value: 'regression' },
              selectionSet: {
                selections: [
                  { kind: 'Field', name: { value: 'averageTemperature' } }
                ]
              }
            }
          ]
        }
      }
    ]
  } as unknown as GraphQLResolveInfo;

  const mockInput = {
    location: 'New York',
    startYear: 2020,
    endYear: 2022,
    averageYears: 3,
    regressionDegree: 2
  };

  const mockResult: WeatherAnalysis = {
    historicalData: [
      { year: 2020, averageTemperature: 15.5, precipitation: 100 },
      { year: 2021, averageTemperature: 16.1, precipitation: 110 }
    ],
    regression: {
      averageTemperature: {
        coefficients: [1.2, -0.3],
        rSquared: 0.95,
        testResults: {
          pValue: 0.03,
          significant: true,
          fStatistic: 10.4
        }
      }
    }
  };

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return weather analysis from service', async () => {
    mockWeatherService.findAll.mockResolvedValue(mockResult);

    const result = await resolver.getWeatherAnalysis(mockInput, mockInfo);

    expect(mockWeatherService.findAll).toHaveBeenCalledWith(
      mockInput.location,
      mockInput.startYear,
      mockInput.endYear,
      mockInput.averageYears,
      ['averageTemperature'],
      ['averageTemperature'],
      mockInput.regressionDegree
    );

    expect(result).toEqual(mockResult);
  });

  it('should throw GraphQLError if service throws', async () => {
    mockWeatherService.findAll.mockRejectedValue(new Error('Service exploded'));

    await expect(
      resolver.getWeatherAnalysis(mockInput, mockInfo)
    ).rejects.toThrow(GraphQLError);
    await expect(
      resolver.getWeatherAnalysis(mockInput, mockInfo)
    ).rejects.toMatchObject({
      message: 'Unexpected error during weather analysis',
      extensions: { code: 'WEATHER_ANALYSIS_FAILED' }
    });
  });
});

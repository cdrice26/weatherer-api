import { Test, TestingModule } from '@nestjs/testing';
import { WeatherFetcherService } from './weather-fetcher.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { WeatherMetric } from '../graphql.schema';

describe('WeatherFetcherService', () => {
  let service: WeatherFetcherService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherFetcherService,
        {
          provide: HttpService,
          useValue: mockHttpService
        }
      ]
    }).compile();

    service = module.get<WeatherFetcherService>(WeatherFetcherService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchWeatherData', () => {
    it('should fetch weather data from API and parse correctly', async () => {
      const mockApiResponse: AxiosResponse = {
        data: {
          daily: {
            time: ['2021-01-01'],
            temperature_2m_mean: [30],
            apparent_temperature_mean: [28],
            precipitation_sum: [0.5],
            snowfall_sum: [1.2],
            wind_speed_10m_max: [10]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders()
        }
      };

      mockHttpService.get.mockReturnValueOnce(of(mockApiResponse));

      const result = await service.fetchWeatherData(40, -75, 2021, 2021, [
        WeatherMetric.AVERAGE_TEMPERATURE,
        WeatherMetric.PRECIPITATION
      ]);

      expect(result).toStrictEqual([
        {
          date: new Date('2021-01-01T00:00:00'),
          metric: WeatherMetric.AVERAGE_TEMPERATURE,
          value: 30
        },
        {
          date: new Date('2021-01-01T00:00:00'),
          metric: WeatherMetric.AVERAGE_APPARENT_TEMPERATURE,
          value: 28
        },
        {
          date: new Date('2021-01-01T00:00:00'),
          metric: WeatherMetric.PRECIPITATION,
          value: 0.5
        },
        {
          date: new Date('2021-01-01T00:00:00'),
          metric: WeatherMetric.SNOWFALL,
          value: 1.2
        },
        {
          date: new Date('2021-01-01T00:00:00'),
          metric: WeatherMetric.MAX_WIND_SPEED,
          value: 10
        }
      ]);
    });

    it('should throw error on malformed API response', async () => {
      mockHttpService.get.mockReturnValueOnce(
        of({ data: {} } as AxiosResponse)
      );

      await expect(
        service.fetchWeatherData(0, 0, 2020, 2021, [])
      ).rejects.toThrow('Failed to fetch weather data');
    });
  });

  describe('parseFields', () => {
    it('should convert field names correctly', () => {
      const fields = [
        WeatherMetric.AVERAGE_TEMPERATURE,
        WeatherMetric.SNOWFALL,
        WeatherMetric.MAX_WIND_SPEED
      ];
      const parsed = WeatherFetcherService.parseFields(fields);
      expect(parsed).toContain('temperature_2m_mean');
      expect(parsed).toContain('snowfall_sum');
      expect(parsed).toContain('wind_speed_10m_max');
    });
  });

  describe('unparseField', () => {
    it('should unparse the field name correctly', () => {
      const fields = [
        'temperature_2m_mean',
        'apparent_temperature_mean',
        'precipitation_sum',
        'snowfall_sum',
        'wind_speed_10m_max'
      ];
      const parsed = fields.map((field) =>
        WeatherFetcherService.unparseField(field)
      );
      expect(parsed).toStrictEqual([
        WeatherMetric.AVERAGE_TEMPERATURE,
        WeatherMetric.AVERAGE_APPARENT_TEMPERATURE,
        WeatherMetric.PRECIPITATION,
        WeatherMetric.SNOWFALL,
        WeatherMetric.MAX_WIND_SPEED
      ]);
    });
  });

  describe('averageWeatherData', () => {
    it('should calculate averages correctly', () => {
      const mockData = [
        {
          date: new Date('2020-01-01T00:00:00'),
          metric: WeatherMetric.AVERAGE_TEMPERATURE,
          value: 10
        },
        {
          date: new Date('2020-12-31T00:00:00'),
          metric: WeatherMetric.AVERAGE_TEMPERATURE,
          value: 20
        },
        {
          date: new Date('2020-01-01T00:00:00'),
          metric: WeatherMetric.AVERAGE_APPARENT_TEMPERATURE,
          value: 12
        },
        {
          date: new Date('2020-12-31T00:00:00'),
          metric: WeatherMetric.AVERAGE_APPARENT_TEMPERATURE,
          value: 22
        },
        {
          date: new Date('2020-01-01T00:00:00'),
          metric: WeatherMetric.PRECIPITATION,
          value: 1
        },
        {
          date: new Date('2020-12-31T00:00:00'),
          metric: WeatherMetric.PRECIPITATION,
          value: 2
        },
        {
          date: new Date('2020-01-01T00:00:00'),
          metric: WeatherMetric.SNOWFALL,
          value: 0
        },
        {
          date: new Date('2020-12-31T00:00:00'),
          metric: WeatherMetric.SNOWFALL,
          value: 1
        },
        {
          date: new Date('2020-01-01T00:00:00'),
          metric: WeatherMetric.MAX_WIND_SPEED,
          value: 5
        },
        {
          date: new Date('2020-12-31T00:00:00'),
          metric: WeatherMetric.MAX_WIND_SPEED,
          value: 15
        }
      ];

      const result = WeatherFetcherService.averageWeatherData(
        mockData,
        2020,
        2020,
        1
      );
      expect(result).toStrictEqual([
        {
          year: 2020,
          metric: WeatherMetric.AVERAGE_TEMPERATURE,
          value: 15
        },
        {
          year: 2020,
          metric: WeatherMetric.AVERAGE_APPARENT_TEMPERATURE,
          value: 17
        },
        {
          year: 2020,
          metric: WeatherMetric.PRECIPITATION,
          value: 1.5
        },
        { year: 2020, metric: WeatherMetric.SNOWFALL, value: 0.5 },
        {
          year: 2020,
          metric: WeatherMetric.MAX_WIND_SPEED,
          value: 10
        }
      ]);
    });
  });
});

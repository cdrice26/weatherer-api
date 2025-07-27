import { Test, TestingModule } from '@nestjs/testing';
import { WeatherFetcherService } from './weather-fetcher.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosHeaders, AxiosResponse } from 'axios';

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
    it('should return default weather data when useDefault is true', async () => {
      const result = await service.fetchWeatherData(0, 0, 2020, 2021, [], true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('year');
    });

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

      const result = await service.fetchWeatherData(
        40,
        -75,
        2021,
        2021,
        ['averageTemperature', 'precipitation'],
        false
      );

      expect(result).toEqual([
        expect.objectContaining({
          year: 2020,
          averageTemperature: 30,
          precipitation: 0.5
        })
      ]);
    });

    it('should throw error on malformed API response', async () => {
      mockHttpService.get.mockReturnValueOnce(
        of({ data: {} } as AxiosResponse)
      );

      await expect(
        service.fetchWeatherData(0, 0, 2020, 2021, [], false)
      ).rejects.toThrow('Failed to fetch weather data');
    });
  });

  describe('parseFields', () => {
    it('should convert field names correctly', () => {
      const fields = ['averageTemperature', 'snowfall', 'maxWindSpeed'];
      const parsed = service.parseFields(fields);
      expect(parsed).toContain('temperature_2m_mean');
      expect(parsed).toContain('snowfall_sum');
      expect(parsed).toContain('wind_speed_10m_max');
    });
  });

  describe('averageWeatherData', () => {
    it('should calculate averages correctly', () => {
      const mockData = [
        {
          date: new Date('2020-01-01T00:00:00'),
          year: 2020,
          averageTemperature: 10,
          averageApparentTemperature: 12,
          precipitation: 1,
          snowfall: 0,
          maxWindSpeed: 5
        },
        {
          date: new Date('2020-12-31T00:00:00'),
          year: 2020,
          averageTemperature: 20,
          averageApparentTemperature: 22,
          precipitation: 2,
          snowfall: 1,
          maxWindSpeed: 15
        }
      ];

      const result = service.averageWeatherData(mockData, 2020, 2020, 1);
      expect(result[0]).toMatchObject({
        year: 2020,
        averageTemperature: 15,
        averageApparentTemperature: 17,
        precipitation: 1.5,
        snowfall: 0.5,
        maxWindSpeed: 10
      });
    });
  });
});

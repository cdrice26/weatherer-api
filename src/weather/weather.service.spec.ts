import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { WeatherFetcherService } from '../weather-fetcher/weather-fetcher.service';
import { GeocoderService } from '../geocoder/geocoder.service';
import { RegressionService } from '../regression/regression.service';
import { WeatherAnalysis, WeatherMetric } from '../graphql.schema';

describe('WeatherService', () => {
  let service: WeatherService;

  // 🧪 Mocks
  const mockWeatherFetcherService = {
    findAll: jest.fn()
  };

  const mockGeocoderService = {
    geocode: jest.fn()
  };

  const mockRegressionService = {
    performRegression: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: WeatherFetcherService, useValue: mockWeatherFetcherService },
        { provide: GeocoderService, useValue: mockGeocoderService },
        { provide: RegressionService, useValue: mockRegressionService }
      ]
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should fetch geocode, weather data, and regression correctly', async () => {
      const mockLocation = 'New York, NY';
      const mockStartYear = 2020;
      const mockEndYear = 2022;
      const mockAverageYears = 3;
      const mockFields = [
        WeatherMetric.AVERAGE_TEMPERATURE,
        WeatherMetric.PRECIPITATION
      ];
      const mockDegree = 2;

      const mockCoordinates = { latitude: 40.7128, longitude: -74.006 };
      const mockHistoricalData = [
        { metric: WeatherMetric.AVERAGE_TEMPERATURE, year: 2020, value: 15 },
        { metric: WeatherMetric.AVERAGE_TEMPERATURE, year: 2021, value: 16 },
        { metric: WeatherMetric.PRECIPITATION, year: 2020, value: 100 },
        { metric: WeatherMetric.PRECIPITATION, year: 2021, value: 110 }
      ];
      const mockRegressionResult = [
        {
          metric: WeatherMetric.AVERAGE_TEMPERATURE,
          results: {
            coefficients: [1, -0.5],
            rSquared: 0.9,
            testResults: {
              pValue: 0.04,
              significant: true,
              fStatistic: 8.5
            }
          }
        },
        {
          metric: WeatherMetric.PRECIPITATION,
          results: {
            coefficients: [1, -0.5],
            rSquared: 0.9,
            testResults: {
              pValue: 0.04,
              significant: true,
              fStatistic: 8.5
            }
          }
        }
      ];

      mockGeocoderService.geocode.mockResolvedValue(mockCoordinates);
      mockWeatherFetcherService.findAll.mockResolvedValue(mockHistoricalData);
      mockRegressionService.performRegression.mockResolvedValue(
        mockRegressionResult
      );

      const result: WeatherAnalysis = await service.findAll(
        mockLocation,
        mockStartYear,
        mockEndYear,
        mockAverageYears,
        mockDegree,
        mockFields
      );

      expect(mockGeocoderService.geocode).toHaveBeenCalledWith(mockLocation);
      expect(mockWeatherFetcherService.findAll).toHaveBeenCalledWith(
        mockCoordinates.latitude,
        mockCoordinates.longitude,
        mockStartYear,
        mockEndYear,
        mockAverageYears,
        mockFields
      );
      expect(mockRegressionService.performRegression).toHaveBeenCalledWith(
        mockHistoricalData,
        mockDegree,
        mockFields,
        0.05
      );
      expect(result).toEqual({
        historicalData: mockHistoricalData,
        regression: mockRegressionResult
      });
    });

    it('should propagate errors from any failing dependency', async () => {
      mockGeocoderService.geocode.mockRejectedValue(
        new Error('Geocoding failed')
      );

      await expect(
        service.findAll('Nowhere', 2000, 2020, 5, 1, [
          WeatherMetric.AVERAGE_TEMPERATURE
        ])
      ).rejects.toThrow('Geocoding failed');
    });
  });
});

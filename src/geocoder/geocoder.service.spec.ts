import { Test, TestingModule } from '@nestjs/testing';
import { GeocoderService } from './geocoder.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse, AxiosHeaders } from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('GeocoderService', () => {
  let service: GeocoderService;
  let httpService: HttpService;
  let configService: ConfigService;
  let cacheManager: Cache;

  const mockHttpService = {
    get: jest.fn()
  };

  const mockConfigService = {
    get: jest.fn()
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeocoderService,
        {
          provide: HttpService,
          useValue: mockHttpService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager
        }
      ]
    }).compile();

    service = module.get<GeocoderService>(GeocoderService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('geocode', () => {
    const mockAddress = '123 Main St';
    const mockApiKey = 'test-key';
    const mockCoordinates = {
      latitude: 40.7128,
      longitude: -74.006
    };
    const mockResponse: AxiosResponse = {
      data: [
        {
          lat: 40.7128,
          lon: -74.006,
          name: '123 main st'
        }
      ],
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders()
      }
    };

    it('should return cached coordinates if available', async () => {
      mockCacheManager.get.mockResolvedValue(mockCoordinates);

      const result = await service.geocode(mockAddress);

      expect(mockCacheManager.get).toHaveBeenCalledWith(mockAddress);
      expect(result).toEqual(mockCoordinates);
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('should call API and cache result if not in cache', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue(mockApiKey);
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.geocode(mockAddress);

      expect(mockCacheManager.get).toHaveBeenCalledWith(mockAddress);
      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        mockAddress,
        mockCoordinates
      );
      expect(result).toEqual(mockCoordinates);
    });

    it('should throw error if response is invalid', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue(mockApiKey);
      mockHttpService.get.mockReturnValue(of({ ...mockResponse, data: [{}] }));

      await expect(service.geocode(mockAddress)).rejects.toThrow(
        'Failed to geocode address'
      );
    });

    it('should throw error on request failure', async () => {
      mockCacheManager.get.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue(mockApiKey);
      mockHttpService.get.mockImplementation(() => {
        throw new Error('Network failure');
      });

      await expect(service.geocode(mockAddress)).rejects.toThrow(
        'Failed to geocode address'
      );
    });
  });
});

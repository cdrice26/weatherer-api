import { Test, TestingModule } from '@nestjs/testing';
import { GeocoderService } from './geocoder.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse, AxiosHeaders } from 'axios';

describe('GeocoderService', () => {
  let service: GeocoderService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    get: jest.fn()
  };

  const mockConfigService = {
    get: jest.fn()
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
        }
      ]
    }).compile();

    service = module.get<GeocoderService>(GeocoderService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('geocode', () => {
    const mockAddress = '123 Main St';
    const mockApiKey = 'test-key';
    const mockResponse: AxiosResponse = {
      data: [
        {
          lat: 40.7128,
          lon: -74.006
        }
      ],
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders()
      }
    };

    it('should return latitude and longitude for a valid address', async () => {
      mockConfigService.get.mockReturnValue(mockApiKey);
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.geocode(mockAddress);

      expect(mockConfigService.get).toHaveBeenCalledWith('GEOCODER_API_KEY');
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(mockAddress))
      );
      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006
      });
    });

    it('should throw error if response does not contain valid coordinates', async () => {
      mockConfigService.get.mockReturnValue(mockApiKey);
      mockHttpService.get.mockReturnValue(of({ ...mockResponse, data: [{}] }));

      await expect(service.geocode(mockAddress)).rejects.toThrow(
        'Failed to geocode address'
      );
    });

    it('should throw error on request failure', async () => {
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

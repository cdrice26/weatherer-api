import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Service for geocoding addresses to latitude and longitude coordinates.
 */
@Injectable()
export class GeocoderService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Geocodes a given address to its corresponding latitude and longitude.
   *
   * @param {string} address - The address to geocode.
   * @returns {Promise<{ latitude: number; longitude: number }>} - A promise that resolves to an object containing latitude and longitude.
   * @throws {Error} - Throws an error if the geocoding fails or if the response is invalid.
   */
  async geocode(
    address: string
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const key = this.configService.get<string>('GEOCODER_API_KEY');
      const response = await firstValueFrom(
        this.httpService.get(
          `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${key}`
        )
      );
      const coords = response.data[0];
      if (!coords || !coords.lat || !coords.lon) {
        throw new Error('Invalid geocoding response');
      }
      return {
        latitude: coords.lat,
        longitude: coords.lon
      };
    } catch (error) {
      throw new Error('Failed to geocode address');
    }
  }
}

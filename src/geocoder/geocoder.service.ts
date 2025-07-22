import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeocoderService {
  private configService: ConfigService = new ConfigService();
  private httpService: HttpService = new HttpService();

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

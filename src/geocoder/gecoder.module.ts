import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeocoderService } from './geocoder.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 60 * 60 * 24 * 3, // 3 days in seconds
      max: 100, // optional: limits the number of items in cache
      isGlobal: true // optional: make cache available globally
    })
  ],
  providers: [GeocoderService],
  exports: [GeocoderService]
})
export class GeocoderModule {}

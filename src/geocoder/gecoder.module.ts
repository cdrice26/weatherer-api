import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeocoderService } from './geocoder.service';

@Module({
  imports: [HttpModule],
  providers: [GeocoderService]
})
export class GeocoderModule {}

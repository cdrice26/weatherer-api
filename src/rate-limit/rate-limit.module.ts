import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RateLimitService } from './rate-limit.service';

@Module({
  imports: [HttpModule],
  providers: [RateLimitService],
  exports: [RateLimitService]
})
export class RateLimitModule {}

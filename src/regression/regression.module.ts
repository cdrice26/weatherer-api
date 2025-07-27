import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RegressionService } from './regression.service';

@Module({
  imports: [HttpModule],
  providers: [RegressionService],
  exports: [RegressionService]
})
export class RegressionModule {}

import { Args, Resolver, Query } from '@nestjs/graphql';
import { WeatherDataInput, WeatherAnalysis } from 'src/graphql.schema';
import { WeatherService } from './weather.service';

@Resolver('WeatherAnalysis')
export class WeatherResolver {
  constructor(private readonly weatherService: WeatherService) {}

  @Query('weatherAnalysis')
  async getWeatherAnalysis(
    @Args('input') input: WeatherDataInput
  ): Promise<WeatherAnalysis> {
    console.log(this.weatherService.findAll());
    return this.weatherService.findAll();
  }
}

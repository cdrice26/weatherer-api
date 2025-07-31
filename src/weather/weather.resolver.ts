import { Args, Resolver, Query } from '@nestjs/graphql';
import { WeatherDataInput, WeatherAnalysis } from '../graphql.schema';
import { WeatherService } from './weather.service';
import { GraphQLError } from 'graphql';
import { RateLimitService } from '../rate-limit/rate-limit.service';
/**
 * Resolver for handling GraphQL queries related to weather analysis.
 */
@Resolver('WeatherAnalysis')
export class WeatherResolver {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly rateLimitService: RateLimitService
  ) {}

  /**
   * GraphQL query to get weather analysis based on the provided input.
   *
   * @param {WeatherDataInput} input - The input data for the weather analysis query.
   * @param {GraphQLResolveInfo} info - Information about the GraphQL query execution.
   * @returns {Promise<WeatherAnalysis>} - A promise that resolves to the weather analysis result.
   */
  @Query('weatherAnalysis')
  async getWeatherAnalysis(
    @Args('input') input: WeatherDataInput
  ): Promise<WeatherAnalysis> {
    if (!this.rateLimitService.isUnderLimit()) {
      throw new GraphQLError('Daily weather API call limit reached', {
        extensions: { code: 'RATE_LIMIT_EXCEEDED' }
      });
    }

    try {
      const response = await this.weatherService.findAll(
        input.location,
        input.startYear,
        input.endYear,
        input.averageYears,
        input.regressionDegree,
        input.metrics
      );
      return response;
    } catch (error) {
      throw new GraphQLError('Unexpected error during weather analysis', {
        extensions: {
          code: 'WEATHER_ANALYSIS_FAILED'
        }
      });
    }
  }
}

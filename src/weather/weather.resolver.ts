import { Args, Resolver, Query, Info } from '@nestjs/graphql';
import { WeatherDataInput, WeatherAnalysis } from '../graphql.schema';
import { WeatherService } from './weather.service';
import { GraphQLResolveInfo, SelectionNode } from 'graphql';

/**
 * Resolver for handling GraphQL queries related to weather analysis.
 */
@Resolver('WeatherAnalysis')
export class WeatherResolver {
  constructor(private readonly weatherService: WeatherService) {}

  /**
   * GraphQL query to get weather analysis based on the provided input.
   *
   * @param {WeatherDataInput} input - The input data for the weather analysis query.
   * @param {GraphQLResolveInfo} info - Information about the GraphQL query execution.
   * @returns {Promise<WeatherAnalysis>} - A promise that resolves to the weather analysis result.
   */
  @Query('weatherAnalysis')
  async getWeatherAnalysis(
    @Args('input') input: WeatherDataInput,
    @Info() info: GraphQLResolveInfo
  ): Promise<WeatherAnalysis> {
    const [fields, regressionFields] = this.getRequestedFields(info);
    return await this.weatherService.findAll(
      input.location,
      input.startYear,
      input.endYear,
      input.averageYears,
      fields,
      regressionFields,
      input.regressionDegree
    );
  }

  /**
   * Extracts the requested fields from the GraphQL query information.
   *
   * @param {GraphQLResolveInfo} info - Information about the GraphQL query execution.
   * @returns {string[][]} - An array containing two arrays: one for fields and one for regression fields.
   */
  private getRequestedFields(info: GraphQLResolveInfo): string[][] {
    const fields: string[] = [];
    const regressionFields: string[] = [];
    const fieldNodes = info.fieldNodes[0].selectionSet.selections;

    fieldNodes.forEach((field: SelectionNode) => {
      if (field.kind === 'Field') {
        if (field.name.value === 'historicalData' && field.selectionSet) {
          // If it's the historicalData field, extract its sub-fields
          field.selectionSet.selections.forEach((subField: SelectionNode) => {
            if (subField.kind === 'Field') {
              fields.push(subField.name.value);
            }
          });
        } else if (field.name.value === 'regression' && field.selectionSet) {
          field.selectionSet.selections.forEach((subField: SelectionNode) => {
            if (subField.kind === 'Field') {
              regressionFields.push(subField.name.value);
            }
          });
        } else {
          // Push other fields as they are
          fields.push(field.name.value);
        }
      } else if (field.kind === 'InlineFragment') {
        // If it's an InlineFragmentNode, extract fields from it
        field.selectionSet.selections.forEach((subField: SelectionNode) => {
          if (subField.kind === 'Field') {
            fields.push(subField.name.value);
          }
        });
      }
    });

    return [fields, regressionFields];
  }
}

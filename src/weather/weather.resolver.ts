import { Args, Resolver, Query, Info } from '@nestjs/graphql';
import { WeatherDataInput, WeatherAnalysis } from 'src/graphql.schema';
import { WeatherService } from './weather.service';
import { GraphQLResolveInfo, SelectionNode } from 'graphql';

@Resolver('WeatherAnalysis')
export class WeatherResolver {
  constructor(private readonly weatherService: WeatherService) {}

  @Query('weatherAnalysis')
  async getWeatherAnalysis(
    @Args('input') input: WeatherDataInput,
    @Info() info: GraphQLResolveInfo
  ): Promise<WeatherAnalysis> {
    const fields = this.getRequestedFields(info);
    return await this.weatherService.findAll(
      input.location,
      input.startYear,
      input.endYear,
      input.averageYears,
      fields
    );
  }

  private getRequestedFields(info: GraphQLResolveInfo): string[] {
    const fields: string[] = [];
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

    return fields;
  }
}

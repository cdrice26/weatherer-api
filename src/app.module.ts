import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule } from '@nestjs/config';
import { weatherSchema } from './weather/schema-loader';
import { DateScalar } from './common/scalars/date.scalar';

@Module({
  providers: [DateScalar],
  imports: [
    WeatherModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typeDefs: weatherSchema,
      transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
      graphiql: true
    })
  ]
})
export class AppModule {}

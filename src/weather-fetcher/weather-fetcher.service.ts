import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getThisYear, getTwoDaysAgo } from '../utils/dateUtils';
import { convertToArrayOfObjects } from '../utils/dataUtils';
import { HistoricalWeatherData } from 'src/graphql.schema';

interface WeatherResponse {
  year?: number;
  date?: Date;
  averageTemperature?: number;
  averageApparentTemperature?: number;
  precipitation?: number;
  snowfall?: number;
  maxWindSpeed?: number;
}

@Injectable()
export class WeatherFetcherService {
  constructor(private readonly httpService: HttpService) {}

  private readonly defaultWeather: WeatherResponse[] = [
    {
      year: 2020,
      averageTemperature: 15.5,
      averageApparentTemperature: 16.0,
      precipitation: 120.5,
      snowfall: 30.0,
      maxWindSpeed: 25.0
    },
    {
      year: 2021,
      averageTemperature: 15.5,
      averageApparentTemperature: 16.0,
      precipitation: 120.5,
      snowfall: 30.0,
      maxWindSpeed: 25.0
    }
  ];

  async findAll(
    lat: number,
    lon: number,
    startYear: number,
    endYear: number,
    averageYears: number,
    fields: string[],
    useDefault = false
  ): Promise<HistoricalWeatherData[]> {
    const weatherData = await this.fetchWeatherData(
      lat,
      lon,
      startYear - averageYears,
      endYear,
      fields,
      useDefault
    );

    const historicalData = this.averageWeatherData(
      weatherData,
      startYear,
      endYear,
      averageYears
    );

    return historicalData;
  }

  async fetchWeatherData(
    lat: number,
    lon: number,
    startYear: number,
    endYear: number,
    fields: string[],
    useDefault = false
  ): Promise<WeatherResponse[]> {
    if (useDefault) {
      console.warn('Using default weather data for testing');
      return this.defaultWeather.map((data) => ({
        ...data,
        date: new Date(`${data.year}-01-01`)
      }));
    }
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://archive-api.open-meteo.com/v1/archive` +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            `&start_date=${startYear}-01-01` +
            `&end_date=${endYear === getThisYear() ? getTwoDaysAgo() : `${endYear}-12-31`}` +
            `&daily=${this.parseFields(fields).join(',')}` +
            `&timezone=auto` +
            `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
        )
      );
      const data = response.data;
      if (!data || !data.daily) {
        throw new Error('Invalid weather data response');
      }
      return convertToArrayOfObjects<string | number>(data.daily).map(
        (day) => ({
          date: new Date(day.time),
          year: new Date(day.time).getFullYear(),
          averageTemperature:
            typeof day.temperature_2m_mean === 'number'
              ? day.temperature_2m_mean
              : null,
          averageApparentTemperature:
            typeof day.apparent_temperature_mean === 'number'
              ? day.apparent_temperature_mean
              : null,
          precipitation:
            typeof day.precipitation_sum === 'number'
              ? day.precipitation_sum
              : null,
          snowfall:
            typeof day.snowfall_sum === 'number' ? day.snowfall_sum : null,
          maxWindSpeed:
            typeof day.wind_speed_10m_max === 'number'
              ? day.wind_speed_10m_max
              : null
        })
      );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch weather data');
    }
  }

  parseFields(fields: string[]): string[] {
    return fields
      .map((field) => {
        switch (field) {
          case 'averageTemperature':
            return 'temperature_2m_mean';
          case 'averageApparentTemperature':
            return 'apparent_temperature_mean';
          case 'precipitation':
            return 'precipitation_sum';
          case 'snowfall':
            return 'snowfall_sum';
          case 'maxWindSpeed':
            return 'wind_speed_10m_max';
          default:
            return null;
        }
      })
      .filter((field) => field !== null);
  }

  averageWeatherData(
    data: WeatherResponse[],
    startYear: number,
    endYear: number,
    movingAverageYears: number
  ): HistoricalWeatherData[] {
    const years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    );

    return years.map((year) => {
      const relevantData = data.filter((day) => {
        const date = new Date(day.date);
        return (
          date.getFullYear() >= year - movingAverageYears + 1 &&
          date.getFullYear() <= year
        );
      });

      const total = relevantData.reduce(
        (acc, day) => {
          acc.averageTemperature += day?.averageTemperature ?? 0;
          acc.averageApparentTemperature +=
            day?.averageApparentTemperature ?? 0;
          acc.precipitation += day?.precipitation ?? 0;
          acc.snowfall += day?.snowfall ?? 0;
          acc.maxWindSpeed += day?.maxWindSpeed ?? 0;
          return acc;
        },
        {
          averageTemperature: 0,
          averageApparentTemperature: 0,
          precipitation: 0,
          snowfall: 0,
          maxWindSpeed: 0
        }
      );

      const count = relevantData.length;

      return {
        year: year,
        averageTemperature: count > 0 ? total.averageTemperature / count : 0,
        averageApparentTemperature:
          count > 0 ? total.averageApparentTemperature / count : 0,
        precipitation: count > 0 ? total.precipitation / count : 0,
        snowfall: count > 0 ? total.snowfall / count : 0,
        maxWindSpeed: count > 0 ? total.maxWindSpeed / count : 0
      };
    });
  }
}

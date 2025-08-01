import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getThisYear, getTwoDaysAgo } from '../utils/dateUtils';
import { HistoricalMetricData, WeatherMetric } from '../graphql.schema';
import { zip } from '../utils/dataUtils';

/**
 * Interface representing the structure of the weather response data.
 */
type WeatherResponse = {
  date: Date;
  value: number;
  metric: WeatherMetric;
};

/**
 * Service for fetching historical weather data.
 */
@Injectable()
export class WeatherFetcherService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetches historical weather data for a specified location and time range.
   *
   * @param {number} lat - The latitude of the location.
   * @param {number} lon - The longitude of the location.
   * @param {number} startYear - The starting year for the data.
   * @param {number} endYear - The ending year for the data.
   * @param {number} averageYears - The number of years to average the data over.
   * @param {WeatherMetric[]} fields - The fields to include in the response.
   * @returns {Promise<HistoricalWeatherData[]>} - A promise that resolves to an array of historical weather data.
   */
  async findAll(
    lat: number,
    lon: number,
    startYear: number,
    endYear: number,
    averageYears: number,
    fields: WeatherMetric[]
  ): Promise<HistoricalMetricData[]> {
    try {
      const weatherData = await this.fetchWeatherData(
        lat,
        lon,
        startYear - (averageYears - 1),
        endYear,
        fields
      );

      const historicalData = WeatherFetcherService.averageWeatherData(
        weatherData,
        startYear,
        endYear,
        averageYears
      );

      return historicalData;
    } catch (e) {
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Fetches weather data from an external API.
   *
   * @param {number} lat - The latitude of the location.
   * @param {number} lon - The longitude of the location.
   * @param {number} startYear - The starting year for the data.
   * @param {number} endYear - The ending year for the data.
   * @param {string[]} fields - The fields to include in the response.
   * @returns {Promise<WeatherResponse[]>} - A promise that resolves to an array of weather response data.
   */
  async fetchWeatherData(
    lat: number,
    lon: number,
    startYear: number,
    endYear: number,
    fields: WeatherMetric[]
  ): Promise<WeatherResponse[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://archive-api.open-meteo.com/v1/archive` +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            `&start_date=${startYear}-01-01` +
            `&end_date=${endYear === getThisYear() ? getTwoDaysAgo() : `${endYear}-12-31`}` +
            `&daily=${WeatherFetcherService.parseFields(fields).join(',')}` +
            `&timezone=auto` +
            `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
        )
      );
      const data = response.data;
      if (!data || !data.daily) {
        throw new Error('Invalid weather data response');
      }
      const d = data.daily;
      const dates: Date[] = d.time.map(
        (time: string) => new Date(time + 'T00:00:00')
      );
      const weather = Object.entries(d)
        .filter((entry) => entry[0] !== 'time')
        .map((entry) => [
          WeatherFetcherService.unparseField(entry[0]),
          entry[1]
        ]) as [WeatherMetric, number[]][];
      const formattedData = weather.flatMap(
        (entry: [WeatherMetric, number[]]) =>
          zip(
            ['date', 'metric', 'value'] as string[],
            dates,
            new Array(dates.length).fill(entry[0]) as WeatherMetric[],
            entry[1]
          )
      ) as WeatherResponse[];
      return formattedData;
    } catch (error) {
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Parses the fields to match the API's expected format.
   *
   * @param {WeatherMetric[]} fields - The fields to parse.
   * @returns {string[]} - An array of parsed field names.
   */
  static parseFields(fields: WeatherMetric[]): string[] {
    return fields
      .map((field) => {
        switch (field) {
          case WeatherMetric.AVERAGE_TEMPERATURE:
            return 'temperature_2m_mean';
          case WeatherMetric.AVERAGE_APPARENT_TEMPERATURE:
            return 'apparent_temperature_mean';
          case WeatherMetric.PRECIPITATION:
            return 'precipitation_sum';
          case WeatherMetric.SNOWFALL:
            return 'snowfall_sum';
          case WeatherMetric.MAX_WIND_SPEED:
            return 'wind_speed_10m_max';
          default:
            return null;
        }
      })
      .filter((field) => field !== null);
  }

  static unparseField(field: string): WeatherMetric {
    switch (field) {
      case 'temperature_2m_mean':
        return WeatherMetric.AVERAGE_TEMPERATURE;
      case 'apparent_temperature_mean':
        return WeatherMetric.AVERAGE_APPARENT_TEMPERATURE;
      case 'precipitation_sum':
        return WeatherMetric.PRECIPITATION;
      case 'snowfall_sum':
        return WeatherMetric.SNOWFALL;
      case 'wind_speed_10m_max':
        return WeatherMetric.MAX_WIND_SPEED;
      default:
        return null;
    }
  }

  /**
   * Averages one target year using the moving average provided
   * @param data - The data to average
   * @param targetYear - The year to get the average of
   * @param windowSize - The number of years to average together
   * @returns
   */
  static getYearAverage(
    data: WeatherResponse[],
    targetYear: number,
    windowSize: number
  ): HistoricalMetricData[] {
    const startRange = targetYear - windowSize + 1;
    const endRange = targetYear;

    const fields = [...new Set(data.map((item) => item.metric))];

    return fields.map((metric) => {
      const relevant = data.filter(
        (entry) =>
          entry.metric === metric &&
          entry.date.getFullYear() >= startRange &&
          entry.date.getFullYear() <= endRange
      );

      const validValues = relevant
        .map((e) => e.value)
        .filter((v): v is number => typeof v === 'number');

      const avg =
        validValues.length > 0
          ? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
          : 0;

      return {
        year: targetYear,
        metric,
        value: avg
      };
    });
  }

  /**
   * Averages the weather data over a specified range of years.
   *
   * @param {WeatherResponse[]} flatData - The weather data to average.
   * @param {number} startYear - The starting year for averaging.
   * @param {number} endYear - The ending year for averaging.
   * @param {number} movingAverageYears - The number of years to consider for the moving average.
   * @returns {HistoricalWeatherData[]} - An array of averaged historical weather data.
   */
  static averageWeatherData(
    flatData: { date: Date; metric: WeatherMetric; value: number }[],
    startYear: number,
    endYear: number,
    movingAverageYears: number
  ): HistoricalMetricData[] {
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    ).flatMap((year) =>
      WeatherFetcherService.getYearAverage(flatData, year, movingAverageYears)
    );
  }
}

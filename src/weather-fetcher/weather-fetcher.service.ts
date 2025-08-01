import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, from, map, mergeMap, toArray } from 'rxjs';
import { getThisYear, getTwoDaysAgo } from '../utils/dateUtils';
import { HistoricalMetricData, WeatherMetric } from '../graphql.schema';
import { zip } from '../utils/dataUtils';

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

      const historicalData = await WeatherFetcherService.getDailyMovingAverage(
        weatherData,
        new Date(`${startYear}-01-01`),
        new Date(`${endYear}-12-31`),
        Math.floor(365.25 * averageYears)
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
   * @returns {Promise<HistoricalMetricData[]>} - A promise that resolves to an array of weather response data.
   */
  async fetchWeatherData(
    lat: number,
    lon: number,
    startYear: number,
    endYear: number,
    fields: WeatherMetric[]
  ): Promise<HistoricalMetricData[]> {
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
          ) as unknown as HistoricalMetricData[]
      ) as HistoricalMetricData[];
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
   * Filters data within a moving window for a given date and metric.
   */
  static filterDataWindow(
    data: HistoricalMetricData[],
    targetDate: Date,
    windowSizeDays: number,
    metric: WeatherMetric
  ): HistoricalMetricData[] {
    const start = new Date(targetDate);
    start.setDate(start.getDate() - windowSizeDays + 1);

    return data.filter(
      (entry) =>
        entry.metric === metric &&
        entry.date >= start &&
        entry.date <= targetDate
    );
  }

  /**
   * Calculates the average of valid values.
   */
  static calculateAverage(values: number[]): number {
    return values.length
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0;
  }

  /**
   * Gets all unique metrics in the dataset.
   */
  static getUniqueMetrics(data: HistoricalMetricData[]): WeatherMetric[] {
    return [...new Set(data.map((entry) => entry.metric))];
  }

  /**
   * Generates all target dates in a range.
   */
  static generateDateRange(startDate: Date, endDate: Date): Date[] {
    const days =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return Array.from({ length: Math.floor(days) + 1 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });
  }

  /**
   *
   * @param data - The data to get the daily moving averages from
   * @param startDate - The first date to consider
   * @param endDate - The last date to consider
   * @param windowSizeInDays - Number of days to average
   * @returns - The data, with values replaced by moving averages
   */
  static async getDailyMovingAverage(
    data: HistoricalMetricData[],
    startDate: Date,
    endDate: Date,
    windowSizeInDays: number
  ): Promise<HistoricalMetricData[]> {
    const metrics = this.getUniqueMetrics(data);
    const targetDates = this.generateDateRange(startDate, endDate);

    return firstValueFrom(
      from(targetDates).pipe(
        mergeMap((date) =>
          from(
            metrics.map<HistoricalMetricData>((metric) => {
              const windowData = this.filterDataWindow(
                data,
                date,
                windowSizeInDays,
                metric
              );
              const values = windowData
                .map((d) => d.value)
                .filter((v): v is number => typeof v === 'number');

              const result = {
                date,
                metric,
                value: this.calculateAverage(values)
              };

              return result;
            })
          )
        ),
        toArray()
      )
    );
  }
}

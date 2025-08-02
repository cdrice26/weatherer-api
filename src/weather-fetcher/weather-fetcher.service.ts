import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getThisYear, getTwoDaysAgo } from '../utils/dateUtils';
import { HistoricalMetricData, WeatherMetric } from '../graphql.schema';
import { zip } from '../utils/dataUtils';
import {
  groupByMetric,
  generateDateRange,
  getWindowEntries,
  parseFields,
  unparseField
} from './helpers';

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
        startYear - averageYears,
        endYear,
        fields
      );

      const historicalData = await WeatherFetcherService.getDailyMovingAverage(
        weatherData,
        new Date(`${startYear}-01-01`),
        new Date(`${endYear}-12-31`),
        Math.floor(averageYears * 365.25)
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
            `&daily=${parseFields(fields).join(',')}` +
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
        .map((entry) => [unparseField(entry[0]), entry[1]]) as [
        WeatherMetric,
        number[]
      ][];
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
    const metricsByGroup = groupByMetric(data);
    const targetDates = generateDateRange(startDate, endDate);

    return [...metricsByGroup.entries()].flatMap(([metric, entries]) =>
      targetDates.map((targetDate) => {
        const window = getWindowEntries(entries, targetDate, windowSizeInDays);
        const average = window.length
          ? window.reduce((sum, e) => sum + e.value, 0) / window.length
          : 0; // Safe default—can be NaN or skipped

        return {
          date: targetDate,
          metric,
          value: average
        };
      })
    );
  }
}

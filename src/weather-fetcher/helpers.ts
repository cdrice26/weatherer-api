import { HistoricalMetricData, WeatherMetric } from '../graphql.schema';

/**
 * Groups historical metric data by metric type.
 *
 * @param {HistoricalMetricData[]} data - Array of historical metric entries.
 * @returns {Map<WeatherMetric, HistoricalMetricData[]>} A map of metrics to their corresponding entries.
 */
export const groupByMetric = (data: HistoricalMetricData[]) =>
  data.reduce((map, entry) => {
    const list = map.get(entry.metric) ?? [];
    map.set(entry.metric, [...list, entry]);
    return map;
  }, new Map<WeatherMetric, HistoricalMetricData[]>());

/**
 * Generates an array of sequential dates between two bounds, inclusive.
 *
 * @param {Date} start - Start date of the range.
 * @param {Date} end - End date of the range.
 * @returns {Date[]} Array of Date objects from start to end.
 */
export const generateDateRange = (start: Date, end: Date): Date[] => {
  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * Retrieves entries that fall within a rolling window ending on a target date.
 *
 * @param {HistoricalMetricData[]} entries - Array of metric data to scan.
 * @param {Date} target - The date to calculate the window against.
 * @param {number} windowSize - Number of days included in the window.
 * @returns {HistoricalMetricData[]} Array of entries within the specified window.
 */
export const getWindowEntries = (
  entries: HistoricalMetricData[],
  target: Date,
  windowSize: number
) => {
  const windowStart = new Date(target);
  windowStart.setDate(windowStart.getDate() - windowSize + 1);

  return entries.filter(({ date }) => {
    const t = date.getTime();
    return t >= windowStart.getTime() && t <= target.getTime();
  });
};

/**
 * Parses the fields to match the API's expected format.
 *
 * @param {WeatherMetric[]} fields - The fields to parse.
 * @returns {string[]} - An array of parsed field names.
 */
export const parseFields = (fields: WeatherMetric[]): string[] => {
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
};

export const unparseField = (field: string): WeatherMetric => {
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
};

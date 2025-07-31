
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum WeatherMetric {
    AVERAGE_TEMPERATURE = "AVERAGE_TEMPERATURE",
    AVERAGE_APPARENT_TEMPERATURE = "AVERAGE_APPARENT_TEMPERATURE",
    PRECIPITATION = "PRECIPITATION",
    SNOWFALL = "SNOWFALL",
    MAX_WIND_SPEED = "MAX_WIND_SPEED"
}

export class WeatherDataInput {
    location: string;
    startYear: number;
    endYear: number;
    averageYears: number;
    regressionDegree: number;
    metrics: WeatherMetric[];
}

export class HistoricalMetricData {
    metric: WeatherMetric;
    year: number;
    value?: Nullable<number>;
}

export class MetricRegression {
    metric: WeatherMetric;
    results: RegressionResults;
}

export class RegressionResults {
    coefficients: number[];
    rSquared: number;
    testResults: FTestResults;
}

export class FTestResults {
    fStatistic: number;
    pValue: number;
    significant: boolean;
}

export class WeatherAnalysis {
    historicalData: HistoricalMetricData[];
    regression: MetricRegression[];
    locationName?: Nullable<string>;
}

export abstract class IQuery {
    abstract weatherAnalysis(input?: Nullable<WeatherDataInput>): Nullable<WeatherAnalysis> | Promise<Nullable<WeatherAnalysis>>;
}

type Nullable<T> = T | null;

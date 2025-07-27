
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class WeatherDataInput {
    location: string;
    startYear: number;
    endYear: number;
    averageYears: number;
    regressionDegree: number;
}

export class HistoricalWeatherData {
    year: number;
    averageTemperature?: Nullable<number>;
    averageApparentTemperature?: Nullable<number>;
    precipitation?: Nullable<number>;
    snowfall?: Nullable<number>;
    maxWindSpeed?: Nullable<number>;
}

export class Regression {
    averageTemperature?: Nullable<RegressionResults>;
    averageApparentTemperature?: Nullable<RegressionResults>;
    precipitation?: Nullable<RegressionResults>;
    snowfall?: Nullable<RegressionResults>;
    maxWindSpeed?: Nullable<RegressionResults>;
}

export class RegressionResults {
    coefficients: Nullable<number>[];
    rSquared: number;
    testResults: FTestResults;
}

export class FTestResults {
    fStatistic: number;
    pValue: number;
    significant: boolean;
}

export class WeatherAnalysis {
    historicalData: HistoricalWeatherData[];
    regression: Regression;
    locationName?: Nullable<string>;
}

export abstract class IQuery {
    abstract weatherAnalysis(input: WeatherDataInput): WeatherAnalysis | Promise<WeatherAnalysis>;
}

type Nullable<T> = T | null;

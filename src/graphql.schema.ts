
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class CreateCatInput {
    name?: Nullable<string>;
    age?: Nullable<number>;
}

export class WeatherDataInput {
    location: string;
    startYear: number;
    endYear: number;
    averageYears: number;
    regressionDegree: number;
}

export abstract class IQuery {
    abstract cats(): Nullable<Nullable<Cat>[]> | Promise<Nullable<Nullable<Cat>[]>>;

    abstract cat(id: string): Nullable<Cat> | Promise<Nullable<Cat>>;

    abstract weatherAnalysis(input: WeatherDataInput): WeatherAnalysis | Promise<WeatherAnalysis>;
}

export abstract class IMutation {
    abstract createCat(createCatInput?: Nullable<CreateCatInput>): Nullable<Cat> | Promise<Nullable<Cat>>;
}

export abstract class ISubscription {
    abstract catCreated(): Nullable<Cat> | Promise<Nullable<Cat>>;
}

export class Owner {
    id: number;
    name: string;
    age?: Nullable<number>;
    cats?: Nullable<Cat[]>;
}

export class Cat {
    id?: Nullable<number>;
    name?: Nullable<string>;
    age?: Nullable<number>;
    owner?: Nullable<Owner>;
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
}

type Nullable<T> = T | null;

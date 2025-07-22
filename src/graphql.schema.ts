
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
    averageTemperature: number;
    averageApparentTemperature: number;
    precipitation: number;
    snowfall: number;
    maxWindSpeed: number;
}

export class RegressionResults {
    coefficients: Nullable<number>[];
    rSquared: number;
    regressionType: string;
    testResults: WaldTestResults;
}

export class WaldTestResults {
    tStatistic: number;
    pValue: number;
    significant: boolean;
}

export class WeatherAnalysis {
    historicalData: HistoricalWeatherData[];
    regression: RegressionResults;
}

type Nullable<T> = T | null;

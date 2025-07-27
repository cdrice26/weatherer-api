# Weatherer API

A NestJS-powered backend service that fetches historical weather data, performs regression analysis, and exposes the results via a GraphQL API. It integrates geocoding, weather data aggregation, and statistical insights in one modular system.

---

## 📦 Project Structure

```text
src/
├── geocoder/                # Geocoding service
│   └── geocoder.service.ts
├── regression/              # Regression analysis service
│   └── regression.service.ts
├── weather-fetcher/         # Weather data retrieval and aggregation
│   ├── weather-fetcher.service.ts
├── weather/                 # Weather service and resolver
│   ├── weather.service.ts
│   └── weather.resolver.ts
├── graphql.schema.ts        # Type definitions from GraphQL schema. This is auto-generated with generate-typings.ts
└── utils/                   # Utility functions
    └── dateUtils.ts, dataUtils.ts
```

---

## 🚀 Features

- 🔍 Geocodes locations using [Maps.co API](https://geocode.maps.co/)
- 📈 Fetches historical weather data from [Open-Meteo Archive API](https://open-meteo.com/)
- 🧠 Performs polynomial regression analysis via external service
- ⚡ GraphQL-powered query interface for fine-grained field selection
- 🛡️ Comprehensive unit test coverage using Jest and NestJS TestingModule

---

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Run specific test files
npm run test src/weather/weather.service.spec.ts
```

---

## 🔌 GraphQL Usage

### Sample Query

```graphql
query {
  weatherAnalysis(input: {
    location: "New York, NY"
    startYear: 2020
    endYear: 2023
    averageYears: 3
    regressionDegree: 2
  }) {
    historicalData {
      year
      averageTemperature
      precipitation
    }
    regression {
      averageTemperature {
        coefficients
        rSquared
        testResults {
          pValue
          significant
          fStatistic
        }
      }
    }
  }
}
```

---

## 🛠 Environment Variables

Create a `.env` file at the project root:

```
GEOCODER_API_KEY=your_maps_co_key_here
REGRESSION_API_URL=https://your-regression-api.com/analyze
```

---

## 📚 How It Works

### WeatherService (Orchestration)
- Uses `GeocoderService` to resolve latitude/longitude from address
- Fetches weather data with `WeatherFetcherService` and aggregates by year
- Passes structured data to `RegressionService` to generate regression models

### GraphQL Resolver
- Extracts requested fields from GraphQL `resolveInfo`
- Delegates to `WeatherService` and handles errors with `GraphQLError`

---

## 🔐 Error Handling

If any service throws an error, the resolver responds with a `GraphQLError`:

```json
{
  "errors": [
    {
      "message": "Service exploded",
      "extensions": {
        "code": "WEATHER_ANALYSIS_FAILED"
      }
    }
  ]
}
```

Clean and predictable GraphQL responses for better client-side handling.
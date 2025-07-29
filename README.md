# Weatherer API

A NestJS-powered backend service that fetches historical weather data, performs regression analysis, and exposes the results via a GraphQL API. It integrates geocoding, weather data aggregation, and statistical insights in one modular system.

---

## Usage

Clone the repo, and run a dev server with `npm run start:dev`. Then open `http://localhost:3000/graphql` in a browser and use the playground to interact with the API.


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
    locationName
  }
}
```

DISCLAIMER: The API is subject to change without warning. Use at your own risk!

---

## 🛠 Environment Variables

Create a `.env` file at the project root:

```
GEOCODER_API_KEY=your_maps_co_key_here
REGRESSION_API_URL=https://your-regression-api.com/analyze
```

Note that the geocoder api key is for [geocode.maps.co](https://geocode.maps.co). Additionally, the regression API is in [this repo](https://github.com/cdrice26/regression-api) - you will need to set that up as well.

---

## Citation for Open-Meteo
Zippenfenig, P. (2023). Open-Meteo.com Weather API [Computer software]. Zenodo. https://doi.org/10.5281/ZENODO.7970649

Hersbach, H., Bell, B., Berrisford, P., Biavati, G., Horányi, A., Muñoz Sabater, J., Nicolas, J., Peubey, C., Radu, R., Rozum, I., Schepers, D., Simmons, A., Soci, C., Dee, D., Thépaut, J-N. (2023). ERA5 hourly data on single levels from 1940 to present [Data set]. ECMWF. https://doi.org/10.24381/cds.adbb2d47

Muñoz Sabater, J. (2019). ERA5-Land hourly data from 2001 to present [Data set]. ECMWF. https://doi.org/10.24381/CDS.E2161BAC

Schimanke S., Ridal M., Le Moigne P., Berggren L., Undén P., Randriamampianina R., Andrea U., Bazile E., Bertelsen A., Brousseau P., Dahlgren P., Edvinsson L., El Said A., Glinton M., Hopsch S., Isaksson L., Mladek R., Olsson E., Verrelle A., Wang Z.Q. (2021). CERRA sub-daily regional reanalysis data for Europe on single levels from 1984 to present [Data set]. ECMWF. https://doi.org/10.24381/CDS.622A565A

Generated using Copernicus Climate Change Service information 2022.

> **NOTE**: Please include the above citations if you use this API.

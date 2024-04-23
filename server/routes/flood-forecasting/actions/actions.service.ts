import { getEnrichedForecasts } from "../../../services/flood-forecast/flood-forecast.service";
import GoogleClient from "../../../services/clients/google.client";
import {
  EnrichedForecast,
  ForecastSet,
  Gauge,
  GaugeIdToForecastMap,
  GaugeModel,
  Thresholds,
} from "../../../types/google/remote-options";

export const getForecastsWithNearestRelevantStartDate = (
  forecasts: GaugeIdToForecastMap,
  condition: keyof Thresholds,
  gaugeModels: GaugeModel[]
) => {
  const forecastsWithNearsRelevantStartDate: GaugeIdToForecastMap = {};
  Object.entries(forecasts).forEach(([gaugeId, forecastSet]) => {
    const forecastWithNearsRelevantStartDate: ForecastSet = {
      forecasts: forecastSet.forecasts
        .sort((a, b) => {
          return (
            new Date(b.issuedTime).getTime() - new Date(a.issuedTime).getTime()
          );
        })
        .slice(0, 1)
        .map((forecast) => {
          let forecastPoints = forecast.forecastPoints.filter(
            (forecastPoint) =>
              new Date(forecastPoint.forecastStartTime) > new Date()
          );
          const gaugeModel = gaugeModels.find((gm) => gm.gaugeId === gaugeId);
          if (!gaugeModel) {
            throw new Error(`Gauge model not found for gaugeId: ${gaugeId}`);
          }

          forecastPoints = forecastPoints.filter(
            (fp) =>
              fp.value >=
              (gaugeModel.thresholds[condition] === 0
                ? gaugeModel.thresholds.dangerLevel
                : gaugeModel.thresholds[condition])
          );

          forecastPoints = forecastPoints.sort((a, b) => {
            return (
              new Date(a.forecastStartTime).getTime() -
              new Date(b.forecastStartTime).getTime()
            );
          });

          forecastPoints = forecastPoints.slice(0, 1);
          return {
            ...forecast,
            forecastPoints,
          };
        }),
    };
    if (forecastWithNearsRelevantStartDate.forecasts.length > 0) {
      forecastsWithNearsRelevantStartDate[gaugeId] =
        forecastWithNearsRelevantStartDate;
    }
  });
  return forecastsWithNearsRelevantStartDate;
};

export const filterForecastsByCondition = (
  enrichedForecasts: EnrichedForecast[],
  condition: keyof Thresholds
) => {
  return enrichedForecasts.filter((forecast) => {
    const threshold =
      forecast.thresholds[condition] === 0
        ? forecast.thresholds.dangerLevel
        : forecast.thresholds[condition];
    const isOverThreshold = forecast.value >= threshold;
    const isLaterThanNow = new Date(forecast.forecastStartTime) > new Date();
    const noMoreThanTwoDays =
      new Date(forecast.forecastEndTime) <
      new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000);
    return isLaterThanNow && isOverThreshold && noMoreThanTwoDays;
  });
};

export const getForecastsByConditions = (
  gauges: Gauge[],
  gaugeModels: GaugeModel[],
  forecasts: GaugeIdToForecastMap,
  condition: keyof Thresholds,
  country: string
) => {
  const forecastsWithNearsRelevantStartDate =
    getForecastsWithNearestRelevantStartDate(forecasts, condition, gaugeModels);

  const enrichedForecasts = getEnrichedForecasts(
    gauges,
    gaugeModels,
    forecastsWithNearsRelevantStartDate,
    country
  );

  return enrichedForecasts;
};

export const fetchForecasts = async (
  country: string,
  condition: keyof Thresholds
) => {
  const googleClient = new GoogleClient();
  const { gauges } = await googleClient.getGauges({
    filter: { countryCode: country },
  });
  if (!gauges) return [];
  const gaugesIds = gauges.map((gauge) => gauge.gaugeId);
  const [gaugeModels, forecasts] = await Promise.all([
    googleClient.getGaugeModels({ filter: { gaugeIds: gaugesIds } }),
    googleClient.getLargeForecasts({ filter: { gaugeIds: gaugesIds } }),
  ]);

  const filteredForecasts = getForecastsByConditions(
    gauges,
    gaugeModels.gaugeModels,
    forecasts.forecasts,
    condition,
    country
  );

  return filteredForecasts;
};

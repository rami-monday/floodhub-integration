import {
  EnrichedForecast,
  Gauge,
  GaugeIdToForecastMap,
  GaugeModel,
  GaugeValueUnit,
  Thresholds,
} from "../../types/google/remote-options";

export const getForecastValueUnit = (gaugeValueUnit: GaugeValueUnit) => {
  switch (gaugeValueUnit) {
    case GaugeValueUnit.METERS:
      return "m";
    case GaugeValueUnit.CUBIC_METERS_PER_SECOND:
      return "m³/s";
    default:
      return "";
  }
};

export const getDangerLevel = (
  value: number,
  thresholds: Thresholds
): EnrichedForecast["dangerLevel"] => {
  if (value >= thresholds.extremeDangerLevel) {
    return "Extreme";
  }
  if (value >= thresholds.dangerLevel) {
    return "Danger";
  }
  if (value >= thresholds.warningLevel) {
    return "Warning";
  }
  return "Normal";
};

export const getEnrichedForecasts = (
  gauges: Gauge[],
  gaugeModels: GaugeModel[],
  forecasts: GaugeIdToForecastMap,
  country: string
): EnrichedForecast[] => {
  const enrichedForecasts: EnrichedForecast[] = [];
  Object.entries(forecasts).forEach(([gaugeId, forecastSet]) => {
    const gauge = gauges.find((gauge) => gauge.gaugeId === gaugeId);
    const gaugeModel = gaugeModels.find((model) => model.gaugeId === gaugeId);
    if (gauge && gaugeModel) {
      const { river, location } = gauge;
      const { thresholds } = gaugeModel;
      forecastSet.forecasts.forEach((forecast) => {
        forecast.forecastPoints.forEach((forecastPoint) => {
          const enrichedForecast: EnrichedForecast = {
            countryCode: country,
            dangerLevel: getDangerLevel(forecastPoint.value, thresholds),
            issuedTime: forecast.issuedTime,
            gaugeId,
            riverName: river,
            location,
            thresholds,
            value: forecastPoint.value,
            unit: getForecastValueUnit(gaugeModel.gaugeValueUnit),
            forecastStartTime: forecastPoint.forecastStartTime,
            forecastEndTime: forecastPoint.forecastEndTime,
            floodHubUrl: `https://sites.research.google/floods/l/${location.latitude}/${location.longitude}/10/g/${gaugeId}`,
          };

          enrichedForecasts.push(enrichedForecast);
        });
      });
    }
  });
  return enrichedForecasts;
};

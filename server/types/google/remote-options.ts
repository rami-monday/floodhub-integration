export type RemoteOption = {
  title: string;
  value: string;
};

export type Point = {
  latitude: number;
  longitude: number;
};
export type Gauge = {
  location: Point;
  siteName: string;
  source: string;
  river: string;
  countryCode: string;
  gaugeId: string;
};

export type Thresholds = {
  warningLevel: number;
  dangerLevel: number;
  extremeDangerLevel: number;
};

export enum GaugeValueUnit {
  GAUGE_VALUE_UNIT_UNSPECIFIED = "GAUGE_VALUE_UNIT_UNSPECIFIED",
  METERS = "METERS",
  CUBIC_METERS_PER_SECOND = "CUBIC_METERS_PER_SECOND",
}

export type GaugeModel = {
  gaugeId: string;
  thresholds: Thresholds;
  gaugeValueUnit: GaugeValueUnit;
};

export type ForecastTimedValue = {
  value: number;
  forecastStartTime: string;
  forecastEndTime: string;
};

export type Forecast = {
  forecastPoints: ForecastTimedValue[];
  issuedTime: string;
};

export type ForecastSet = {
  forecasts: Forecast[];
};

export type GaugeIdToForecastMap = { [gaugeId: string]: ForecastSet };

export type EnrichedForecast = {
  countryCode: string;
  gaugeId: string;
  riverName: string;
  location: Point;
  dangerLevel: "Warning" | "Danger" | "Extreme" | "Normal";
  thresholds: Thresholds;
  value: number;
  forecastStartTime: string;
  forecastEndTime: string;
  issuedTime: string;
  unit: string;
  floodHubUrl: string;
};

import { Gauge, RemoteOption } from "../../../types/google/remote-options";

export const serializeGaugeOption = (gauge: Gauge): RemoteOption => {
  return {
    value: gauge.gaugeId,
    title: `${gauge.siteName} - ${gauge.river} - ${gauge.source}`,
  };
};
export const serializeGaugesOptions = (gauges: Gauge[]): RemoteOption[] => {
  return gauges.map(serializeGaugeOption);
};

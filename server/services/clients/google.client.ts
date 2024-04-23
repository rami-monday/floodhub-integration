import MondayLogger from "../logger.service";
import { getSecret } from "../secrets.service";
import { HttpMethod } from "../../types/http.type";
import {
  Forecast,
  ForecastSet,
  Gauge,
  GaugeModel,
} from "../../types/google/remote-options";
import { SUPPORTED_COUNTRIES } from "../../constants/google.const";
import axios, { AxiosRequestConfig } from "axios";
import { splitArrays } from "../utils/arrays";

const logger = new MondayLogger("google-client");
class GoogleClient {
  private token: string | undefined;
  private baseUrl: string;
  constructor() {
    this.token = getSecret("GOOGLE_API_TOKEN");
    this.baseUrl = "https://floodforecasting.googleapis.com/";
  }

  private async fetch(
    url: string,
    {
      method,
      body,
      query,
    }: {
      method: HttpMethod;
      body?: Record<string, any>;
      query?: Record<string, any>;
    }
  ) {
    if (!this.token) {
      logger.error("No google token found");
      throw new Error("No google token found");
    }

    const finalUrl = `${this.baseUrl}${url}`;

    const requestData: AxiosRequestConfig = {
      url: finalUrl,
      headers: {
        "Content-Type": "application/json",
      },
      method,
      data: body,
      params: {
        key: this.token,
        ...query,
      },
    };
    try {
      logger.info("Fetching data from google API", {
        ...requestData,
        params: { ...requestData.params, key: "" },
        key: "",
      });
      const response = await axios(requestData);

      return response.data;
    } catch (error) {
      logger.error("Error fetching data from google API", {
        ...requestData,
        key: "",
        error,
      });
      throw error;
    }
  }

  public async getGauges(options: {
    filter: { countryCode: string };
  }): Promise<{ gauges: Gauge[] }> {
    const { filter } = options;
    // Call google API
    return this.fetch("v1/gauges:search", {
      method: HttpMethod.POST,
      body: {
        regionCode: filter.countryCode,
      },
    });
  }

  public async getGaugeModels(options: {
    filter: { gaugeIds: string[] };
  }): Promise<{ gaugeModels: GaugeModel[] }> {
    const { filter } = options;
    // Call google API

    const gaugeNames = filter.gaugeIds.map(
      (gaugeId) => `names=gaugeModels/${gaugeId}`
    );

    const namesQuery = gaugeNames.join("&");
    const response = this.fetch(`v1/gaugeModels:batchGet?${namesQuery}`, {
      method: HttpMethod.GET,
    });

    return response;
  }

  public async getForecasts(options: {
    filter: { gaugeIds: string[] };
  }): Promise<{ forecasts: { [gaugeId: string]: ForecastSet } }> {
    const { filter } = options;
    // Call google API
    const currentDate = new Date();
    const lastWeekDate = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
    );
    const tomorrowDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    const gaugeIds = filter.gaugeIds.map((gaugeId) => `gaugeIds=${gaugeId}`);

    const gaugeIdsQuery = gaugeIds.join("&");

    const response = this.fetch(
      // `v1/gauges:queryGaugeForecasts?${gaugeIdsQuery}&issuedTimeStart=${lastWeekDate.toISOString()}`,
      `v1/gauges:queryGaugeForecasts?${gaugeIdsQuery}`,
      {
        method: HttpMethod.GET,
        query: {
          issuedTimeStart: lastWeekDate.toISOString(),
          issuedTimeEnd: tomorrowDate.toISOString(),
        },
      }
    );

    return response;
  }

  public async getLargeForecasts(options: {
    filter: { gaugeIds: string[] };
  }): Promise<{ forecasts: { [gaugeId: string]: ForecastSet } }> {
    const { filter } = options;
    const gaugeIdsSmallerArrays = splitArrays(filter.gaugeIds, 10);

    const results = await Promise.all(
      gaugeIdsSmallerArrays.map((ids) =>
        this.getForecasts({
          filter: {
            gaugeIds: ids,
          },
        })
      )
    );

    const finalResult: { forecasts: { [gaugeId: string]: ForecastSet } } = {
      forecasts: {},
    };
    results.forEach((result) => {
      Object.entries(result.forecasts).forEach(([gaugeId, forecasts]) => {
        finalResult.forecasts[gaugeId] = forecasts;
      });
    });

    return finalResult;
  }

  getCountries() {
    logger.info("Fetching supported countries");
    return SUPPORTED_COUNTRIES;
  }
}

export default GoogleClient;

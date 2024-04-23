import { Response } from "express";
import { MondayRequest } from "../../../types/monday/session.type";
import { fetchForecasts } from "./actions.service";
import { Thresholds } from "../../../types/google/remote-options";
import MondayLogger from "../../../services/logger.service";
import MondayClient from "../../../services/clients/monday.client";
import MondayItemLock from "../../../services/storage/monday-items-lock";
import { getUTCDate } from "../../../services/utils/date";
import { SUPPORTED_COUNTRIES } from "../../../constants/google.const";

const logger = new MondayLogger("flood-forecasting-actions-controller");

export const pollingCountry = async (req: MondayRequest, res: Response) => {
  const { shortLivedToken } = req.session || {};
  const { payload = {} } = req.body;
  const { inputFields } = payload;
  const condition = inputFields?.condition as { value: keyof Thresholds };
  const country = inputFields?.country;
  const boardId = inputFields?.boardId;
  const alertValueColumn = inputFields?.alertValue;
  const floodHubUrlColumn = inputFields?.floodHubUrl;
  const startTimeColumn = inputFields?.startTime;
  const endTimeColumn = inputFields?.endTime;
  const riverNameColumn = inputFields?.riverName;
  const dangerLevelColumn = inputFields?.dangerLevel;
  const locationColumn = inputFields?.location;

  if (!shortLivedToken) {
    logger.error("Polling by country action failed, missing shortLivedToken");
    return res.status(401).end();
  }

  logger.info("Polling by country action started", { payload });

  const filteredForecasts = await fetchForecasts(
    country.value,
    condition.value
  );

  const mondayClient = new MondayClient(shortLivedToken);
  const mondayItemsLock = new MondayItemLock(shortLivedToken);

  const lockedForecasts = await mondayItemsLock.getLockedItems(boardId);
  const forecastsWithoutLock = filteredForecasts.filter(
    (forecast) =>
      !lockedForecasts.some(
        (lock) =>
          lock.gaugeId === forecast.gaugeId &&
          lock.startTime === forecast.forecastStartTime &&
          lock.endTime === forecast.forecastEndTime
      )
  );

  const items = await Promise.all(
    forecastsWithoutLock.map((forecast) => {
      const countryName = SUPPORTED_COUNTRIES.find(
        (c) => c.value === country.value
      )?.title;
      const itemName = `${forecast.riverName}, ${countryName} - ${forecast.gaugeId} `;

      const columnValues: Record<string, any> = {};

      if (alertValueColumn)
        columnValues[alertValueColumn] = `${forecast.value} ${forecast.unit}`;

      if (floodHubUrlColumn)
        columnValues[floodHubUrlColumn] = {
          url: forecast.floodHubUrl,
          text: "go to floodhub!",
        };

      if (startTimeColumn)
        columnValues[startTimeColumn] = getUTCDate(forecast.forecastStartTime);

      if (endTimeColumn)
        columnValues[endTimeColumn] = getUTCDate(forecast.forecastEndTime);

      if (riverNameColumn) columnValues[riverNameColumn] = forecast.riverName;

      if (dangerLevelColumn)
        columnValues[dangerLevelColumn] = forecast.dangerLevel;

      if (locationColumn)
        columnValues[locationColumn] = {
          lat: forecast.location.latitude,
          lng: forecast.location.longitude,
          address: `${forecast.riverName}, ${countryName}`,
        };

      return mondayClient.createItem(boardId, itemName, columnValues);
    })
  );

  items.length > 0 &&
    (await mondayItemsLock.lockForecast(
      boardId,
      filteredForecasts.map((forecast) => ({
        startTime: forecast.forecastStartTime,
        endTime: forecast.forecastEndTime,
        gaugeId: forecast.gaugeId,
      }))
    ));

  logger.info("Polling by country action finished", {
    alertsCount: filteredForecasts?.length,
    itemsCount: items?.length,
  });

  res.end();
};

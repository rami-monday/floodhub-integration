import { Response } from "express";
import GoogleClient from "../../../services/clients/google.client";
import { MondayRequest } from "../../../types/monday/session.type";
import { serializeGaugesOptions } from "./remote-options.service";
import { RemoteOption } from "../../../types/google/remote-options";
import MondayLogger from "../../../services/logger.service";

const logger = new MondayLogger("remote-options-controller");
export const gaugesController = async (req: MondayRequest, res: Response) => {
  const googleClient = new GoogleClient();
  const { payload } = req.body;
  const country: RemoteOption = payload?.country;
  const result = await googleClient.getGauges({
    filter: {
      countryCode: country.value,
    },
  });
  const serializedGauges = serializeGaugesOptions(result.gauges);
  res.send(serializedGauges);
};

export const countriesController = (_req: MondayRequest, res: Response) => {
  const googleClient = new GoogleClient();
  const result = googleClient.getCountries();
  logger.info("Countries fetched", { countries: result.length });
  res.send(result);
};

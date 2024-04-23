import { Response, Router } from "express";
import { authenticationMiddleware } from "../../../middlewares/monday-auth.middleware";
import { MondayRequest } from "../../../types/monday/session.type";
import GoogleClient from "../../../services/clients/google.client";
import { getForecastsByConditions } from "./actions.service";
import { Thresholds } from "../../../types/google/remote-options";
import MondayLogger from "../../../services/logger.service";
import { errorControllerWrapper } from "../../../services/utils/error-controller-wrapper";
import { pollingCountry } from "./actions.controller";

const router = Router();
const logger = new MondayLogger("flood-forecasting-actions");
router.post(
  "/polling",
  authenticationMiddleware,
  errorControllerWrapper(pollingCountry)
);

export default router;

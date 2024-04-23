import { Router } from "express";
import {
  countriesController,
  gaugesController,
} from "./remote-options.controller";
import { authenticationMiddleware } from "../../../middlewares/monday-auth.middleware";
import { errorControllerWrapper } from "../../../services/utils/error-controller-wrapper";

const router = Router();

router.post(
  "/gauges",
  authenticationMiddleware,
  errorControllerWrapper(gaugesController)
);
router.post(
  "/countries",
  authenticationMiddleware,
  errorControllerWrapper(countriesController)
);

export default router;

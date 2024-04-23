import { Router } from "express";
import floodForecastingRoutes from "./flood-forecasting";

const router = Router();

router.use("/flood-forecasting", floodForecastingRoutes);

export default router;

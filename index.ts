import { errorMiddleware } from "./server/middlewares/error.middleware";
import express from "express";
import allRoutes from "./server/routes";
import MondayLogger from "./server/services/logger.service";
import { createNamespace } from "cls-hooked";
import path from 'path';

const logger = new MondayLogger("app-startup");
const app = express();
const PORT = process.env.PORT || 8080;
const namespace = createNamespace("request-context");

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use((req, res, next) => {
  namespace.bindEmitter(req);
  namespace.bindEmitter(res);
  namespace.run(() => {
    next();
  });
});

app.use("/api", allRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  logger.info(`Server is running`, { port: PORT });
});

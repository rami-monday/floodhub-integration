import { NextFunction, Request, Response } from "express";
import MondayLogger from "../services/logger.service";

const logger = new MondayLogger("error-middleware");
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof Error) {
    logger.error(err.message, err);
    return res.status(500).send("Something broke!");
  }
  next(err);
};

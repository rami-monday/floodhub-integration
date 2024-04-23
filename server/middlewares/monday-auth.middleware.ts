import jwt from "jsonwebtoken";
import MondayLogger from "../services/logger.service";
import { NextFunction, Response } from "express";
import { getSecret } from "../services/secrets.service";
import { MondayRequest, MondaySession } from "../types/monday/session.type";
import { getContext, setContext } from "../services/context/request-context";

const TAG = "authentication_middleware";
const logger = new MondayLogger(TAG);
/**
 * Checks that the authorization token in the header is signed with your app's signing secret.
 * Docs: https://developer.monday.com/apps/docs/integration-authorization#authorization-header
 * @todo: Attach this middleware to every endpoint that receives requests from monday.com
 */
export async function authenticationMiddleware(
  req: MondayRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { authorization } = req.headers;

    let token: string | undefined = authorization;
    if (!token && req.query) {
      token = req.query.token as string;
    }
    const secret = getSecret("MONDAY_SIGNING_SECRET");
    if (!secret) {
      throw new Error("MONDAY_SIGNING_SECRET is not set");
    }

    if (!token) {
      throw new Error("no token provided");
    }

    const payload = jwt.verify(token, secret) as MondaySession;

    if (!payload) {
      throw new Error("invalid token");
    }

    const { accountId, userId, backToUrl, shortLivedToken } = payload;
    req.session = { accountId, userId, backToUrl, shortLivedToken };
    const context = getContext();
    setContext({ accountId, userId });
    next();
  } catch (err) {
    const error = err as { message: string };
    logger.error("failed to authenticate", { message: error?.message });
    res.status(401).json({ error: "not authenticated" });
  }
}

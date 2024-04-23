import { Request } from "express";

export type MondaySession = {
  accountId: string;
  userId: string;
  backToUrl: string;
  shortLivedToken: string;
};

export type MondayRequest = Request & {
  session?: MondaySession;
};

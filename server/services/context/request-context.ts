import { getNamespace } from "cls-hooked";
import crypto from "crypto";

export type RequestContext = {
  userId: string;
  accountId: string;
  requestId: string;
};

// Function to set the context
export function setContext(
  value: Pick<RequestContext, "accountId" | "userId">
) {
  const namespace = getNamespace("request-context");
  const uuid = crypto.randomUUID();
  if (namespace) {
    const result = namespace.set("requestContext", {
      ...value,
      requestId: uuid,
    });

    return result;
  }
}

// Function to get the context
export function getContext() {
  const namespace = getNamespace("request-context");

  if (namespace) {
    const context = namespace.get("requestContext") as RequestContext;
    return context;
  }

  return {};
}

import type { Instrumentation } from "next";

/**
 * Server errors that nothing else caught (rendering, route handlers, server
 * actions) are logged and, in production, emailed to the founder; see
 * src/server/alerts.ts for what an alert contains and how often it is sent.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { reportServerError } = await import("@/server/alerts");
  await reportServerError({ where: `${context.routeType} ${context.routePath}`, error, path: request.path });
};

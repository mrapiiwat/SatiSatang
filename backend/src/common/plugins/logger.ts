import { Elysia } from "elysia";
import pino from "pino";
import pretty from "pino-pretty";

const stream = pretty({
  colorize: true,
  translateTime: "SYS:standard",
  ignore: "pid,hostname",
});

const log = pino(stream);

export const logger = new Elysia({ name: "logger" })
  .onRequest(({ request }) => {
    const url = new URL(request.url);
    const fullPath = `${url.pathname}${url.search}`;
    log.info(`[${request.method}] ${fullPath} - Incoming Request`);
  })
  .onAfterResponse(({ request, set }) => {
    const url = new URL(request.url);
    const fullPath = `${url.pathname}${url.search}`;

    log.info(
      `[${request.method}] ${fullPath} - Processed (Status: ${set.status})`
    );
  })
  .onError(({ request, error, set }) => {
    const url = new URL(request.url);
    const fullPath = `${url.pathname}${url.search}`;

    log.error(
      `[${request.method}] ${fullPath} - Failed (Status: ${set.status}) | Error: ${error}`
    );
  });

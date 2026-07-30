import pino, { type LoggerOptions } from "pino";
import { env } from "../config/env.js";

// create a base configuration object
const config: LoggerOptions = {
  level: env.NODE_ENV === "production" ? "info" : "debug",
};

// only add the transport property if we are NOT in production
if (env.NODE_ENV !== "production") {
  config.transport = {
    target: "pino-pretty",
  };
}

export const logger = pino(config);
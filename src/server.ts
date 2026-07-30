import { createApp } from './app.js';
import { env } from "./config/env.js";
import { logger } from "./core/logger.js";

const app = createApp();

async function server() {
  try {
    app.listen(env.PORT, () => {
      logger.info(
        `API Gateway running on http://${env.HOST}:${env.PORT}`
      );
    });
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
}

server();
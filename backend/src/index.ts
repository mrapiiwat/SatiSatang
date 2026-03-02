import { Elysia } from "elysia";
import { errorMiddleware } from "@/common/middlewares/error.middleware";
import { logger } from "@/common/plugins/logger";
import modules from "@/modules";

const PORT = Bun.env.PORT ? parseInt(Bun.env.PORT, 10) : 8080;
const app = new Elysia()
  .use(errorMiddleware)
  .use(logger)
  .use(modules)
  .listen(PORT);

console.log(
  `Server is running at http://${app.server?.hostname}:${app.server?.port}`
);

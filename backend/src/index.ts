import { Elysia } from "elysia";
import { errorMiddleware } from "@/common/middlewares/error.middleware";
import { logger } from "@/common/plugins/logger";
import { ragService } from "@/common/services/rag.service";
import modules from "@/modules";

const PORT = Bun.env.PORT ? parseInt(Bun.env.PORT, 10) : 8080;
const app = new Elysia()
  .use(errorMiddleware)
  .use(logger)
  .onStart(async () => {
    await ragService.ensureCollections();
  })
  .use(modules)
  .listen(PORT);

console.log(
  `Server is running at http://${app.server?.hostname}:${app.server?.port}`
);

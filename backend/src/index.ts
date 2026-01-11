import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { errorMiddleware } from "@/common/middlewares/error.middleware";
import { logger } from "@/common/plugins/logger";
import modules from "@/modules";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const app = new Elysia()
  .use(errorMiddleware)
  .use(logger)
  .use(
    cors({
      origin: process.env.FRONTEND_BASE_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(modules)
  .listen(PORT);

console.log(
  `Server is running at http://${app.server?.hostname}:${app.server?.port}`
);

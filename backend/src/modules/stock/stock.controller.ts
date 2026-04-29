import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { authenticateJWT } from "@/common/middlewares/auth.middleware";
import * as stockSchema from "./stock.schema";
import { StockService } from "./stock.service";

const stockService = new StockService();

export const stockController = new Elysia({ prefix: "/stock", tags: ["STOCK"] })
  .use(authenticateJWT)
  .guard(
    {
      detail: {
        security: [{ JwtAuth: [] }],
      },
    },
    (app) =>
      app
        .get(
          "/",
          async ({ query, set }) => {
            const result = await stockService.getStocks(query);

            set.status = StatusCodes.OK;
            return {
              message: "Get stock list successfully",
              data: result,
            };
          },
          {
            query: stockSchema.GetStocksQuerySchema,
          }
        )
        .get(
          "/:id",
          async ({ params: { id }, set }) => {
            const result = await stockService.getStockById(id);

            set.status = StatusCodes.OK;
            return {
              data: result,
            };
          },
          {
            params: stockSchema.paramsId,
          }
        )
  );
